import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db.session import get_db
from db.models import Document
from services.storage import upload_file, get_signed_url

router = APIRouter(prefix="/documents", tags=["documents"])

# Allowed file types
ALLOWED_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "text/plain": ".txt",
}


@router.post("/upload")
async def upload_document(
    bot_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400, detail=f"File type not allowed. Accepted: PDF, DOCX, TXT"
        )

    # Read file contents
    contents = await file.read()

    # Validate file size — max 10MB
    max_size = 10 * 1024 * 1024  # 10MB in bytes
    if len(contents) > max_size:
        raise HTTPException(
            status_code=400, detail="File too large. Maximum size is 10MB"
        )

    # Create a unique filename so files never overwrite each other
    # Format: bot_id/unique_id_originalname.ext
    unique_id = str(uuid.uuid4())[:8]
    extension = ALLOWED_TYPES[file.content_type]
    safe_filename = f"{bot_id}/{unique_id}_{file.filename}"

    # Upload to R2
    file_url = upload_file(
        file_bytes=contents,
        filename=safe_filename,
        content_type=file.content_type,
    )

    # Save document record to database
    document = Document(
        bot_id=bot_id,
        filename=file.filename,
        file_url=safe_filename,  # store the R2 key, not the full URL
        status="uploaded",
    )
    db.add(document)
    await db.flush()  # assigns the ID without committing yet

    return {
        "id": document.id,
        "filename": document.filename,
        "status": document.status,
        "size_bytes": len(contents),
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

    # Delete from R2
    from services.storage import delete_file

    delete_file(document.file_url)

    # Delete from DB
    await db.delete(document)

    return {"message": "Document deleted"}
