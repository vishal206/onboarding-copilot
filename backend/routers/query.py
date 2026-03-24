from fastapi import APIRouter
from services.rag import RAGPipeline
from pydantic import BaseModel

router = APIRouter(prefix="/query", tags=["query"])


class QueryRequest(BaseModel):
    bot_id: str
    question: str


@router.post("/")
async def query(request: QueryRequest):

    rag = RAGPipeline(request.bot_id)
    results = await rag.query(request.question)
    return {"results": results}
