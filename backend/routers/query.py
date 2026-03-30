from http.client import HTTPException

from services.openai import OpenAi
from services.prompt_builder import PromptBuilder
from fastapi import APIRouter, Depends
from services.rag import RAGPipeline
from pydantic import BaseModel
from db.models import Bot, Conversation, Message
from db.session import AsyncSessionLocal, get_db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/query", tags=["query"])


class QueryRequest(BaseModel):
    bot_id: str
    question: str
    session_id: str
    conversation_history: list[dict] = []


@router.post("/chat")
async def query(request: QueryRequest, db: AsyncSession = Depends(get_db)):

    rag = RAGPipeline(request.bot_id)
    chunks = await rag.query(request.question)

    result = await db.execute(select(Bot).where(Bot.id == request.bot_id))
    botObject = result.scalar_one_or_none()
    if not botObject:
        raise HTTPException(status_code=404, detail="Bot not found")

    prompt = PromptBuilder(
        bot=botObject,
        chunks=chunks,
        question=request.question,
    ).build()

    conv_result = await db.execute(
        select(Conversation).where(Conversation.session_id == request.session_id)
    )
    conversation = conv_result.scalar_one_or_none()

    if not conversation:
        conversation = Conversation(
            bot_id=request.bot_id, session_id=request.session_id
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)

    user_message = Message(
        conversation_id=conversation.id, role="user", content=request.question
    )
    db.add(user_message)
    await db.commit()

    async def stream_and_save():
        full_response = ""

        async for token in OpenAi(prompt).generate():
            full_response += token
            yield token

        async with AsyncSessionLocal() as save_db:
            assistant_message = Message(
                conversation_id=str(conversation.id),
                role="assistant",
                content=full_response,
            )
            save_db.add(assistant_message)
            await save_db.commit()

    return StreamingResponse(stream_and_save(), media_type="text/plain")
