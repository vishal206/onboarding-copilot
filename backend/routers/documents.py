from services.pipeline import process_document
from services.embedder import Embedder
from services.chunker import Chunker
from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException,
    BackgroundTasks,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.session import get_db
from db.models import Document, Bot, DocumentChunk, User
from services.storage import delete_file, upload_file
from services.parser import Parser
from auth import get_current_user_id
import uuid

router = APIRouter(prefix="/documents", tags=["documents"])

# Allowed file types
ALLOWED_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "text/plain": ".txt",
}

MAX_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload")
async def upload_document(
    background_task: BackgroundTasks,
    file: UploadFile = File(...),
    bot_id: str = Form(...),
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id),
):
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="File type not allowed")

    # Validate file size
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max size is 10MB")

    # Auto-create bot if it doesn't exist
    result = await db.execute(select(Bot).where(Bot.id == bot_id))
    bot = result.scalar_one_or_none()

    if not bot:
        # Get internal user ID from clerk_user_id
        user_result = await db.execute(
            select(User).where(User.clerk_user_id == clerk_user_id)
        )
        user = user_result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found in database")

        bot = Bot(
            id=bot_id,
            user_id=str(user.id),  # internal UUID, not clerk_user_id
            name="Default Bot",
            system_prompt="You are a helpful onboarding assistant.",
            welcome_message="Hi! How can I help you today?",
            is_active=True,
        )
        db.add(bot)
        try:
            await db.flush()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating bot: {str(e)}")

    # Upload to R2
    file_key = f"{bot_id}/{uuid.uuid4()}_{file.filename}"
    try:
        file_url = await upload_file(contents, file_key, file.content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

    # Save document record to DB
    document = Document(
        bot_id=str(bot_id),
        filename=file.filename,
        file_url=file_url,
        status="uploaded",
    )

    db.add(document)
    try:
        await db.commit()
        await db.refresh(document)
    except Exception as e:
        await delete_file(file_key)
        raise HTTPException(
            status_code=500, detail=f"Error committing document: {str(e)}"
        )

    try:
        # Parse after document is saved
        raw_text = Parser(contents, file.content_type).parse()
    except Exception as e:
        document.status = "failed"
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Error parsing document: {str(e)}")

    if not raw_text.strip():
        document.status = "failed"
        await db.commit()
        raise HTTPException(
            status_code=400, detail="No text could be extracted from the document"
        )
    document.raw_text = raw_text
    document.status = "parsed"
    await db.commit()

    background_task.add_task(process_document, str(document.id))

    return {
        "id": str(document.id),
        "filename": document.filename,
        "status": document.status,
    }


@router.get("/{bot_id}")
async def list_documents(
    bot_id: str,
    db: AsyncSession = Depends(get_db),
):
    """List all documents for a bot."""
    result = await db.execute(select(Document).where(Document.bot_id == bot_id))
    documents = result.scalars().all()
    return documents


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a document from DB and R2."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete from R2e
    from services.storage import delete_file

    delete_file(document.file_url)

    # Delete from DB
    await db.delete(document)

    return {"message": "Document deleted"}


@router.get("/{document_id}/status")
async def get_document_status(document_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": document.status}
