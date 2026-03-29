from http.client import HTTPException

from services.openai import OpenAi
from services.prompt_builder import PromptBuilder
from fastapi import APIRouter, Depends
from services.rag import RAGPipeline
from pydantic import BaseModel
from db.models import Bot
from db.session import get_db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/query", tags=["query"])


class QueryRequest(BaseModel):
    bot_id: str
    question: str


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

    return StreamingResponse(OpenAi(prompt).generate(), media_type="text/plain")
