import json
from datetime import datetime

from services.openai import OpenAi
from services.prompt_builder import PromptBuilder
from fastapi import APIRouter, Depends, HTTPException, Request
from services.rag import RAGPipeline
from pydantic import BaseModel
from db.models import Bot, Conversation, Message, UsageEvent
from db.session import AsyncSessionLocal, get_db
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import StreamingResponse
from rate_limit import limiter

# Daily per-bot kill switch: 200K tokens/day
DAILY_TOKEN_CAP = 200_000

router = APIRouter(prefix="/query", tags=["query"])


class QueryRequest(BaseModel):
    bot_id: str
    question: str
    session_id: str
    conversation_history: list[dict] = []


async def _daily_tokens_used(bot_id: str, db: AsyncSession) -> int:
    day_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(func.coalesce(func.sum(UsageEvent.input_tokens + UsageEvent.output_tokens), 0))
        .where(UsageEvent.bot_id == bot_id)
        .where(UsageEvent.created_at >= day_start)
    )
    return result.scalar() or 0


@router.post("/chat")
@limiter.limit("30/minute")
async def query(request: Request, body: QueryRequest, db: AsyncSession = Depends(get_db)):

    # Daily token cap kill switch
    daily_tokens = await _daily_tokens_used(body.bot_id, db)
    if daily_tokens >= DAILY_TOKEN_CAP:
        raise HTTPException(
            status_code=429,
            detail="This bot has reached its daily usage limit. Please try again tomorrow.",
        )

    rag = RAGPipeline(body.bot_id)
    chunks = await rag.query(body.question)

    result = await db.execute(select(Bot).where(Bot.id == body.bot_id))
    botObject = result.scalar_one_or_none()
    if not botObject:
        raise HTTPException(status_code=404, detail="Bot not found")

    prompt = PromptBuilder(
        bot=botObject,
        chunks=chunks,
        question=body.question,
    ).build()

    conv_result = await db.execute(
        select(Conversation).where(Conversation.session_id == body.session_id)
    )
    conversation = conv_result.scalar_one_or_none()

    if not conversation:
        conversation = Conversation(
            bot_id=body.bot_id, session_id=body.session_id
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)

    user_message = Message(
        conversation_id=conversation.id, role="user", content=body.question
    )
    db.add(user_message)
    await db.commit()

    async def stream_and_save():
        full_response = ""

        async for token in OpenAi(prompt, bot_id=body.bot_id).generate():
            full_response += token
            yield token

        sources = list({chunk["filename"] for chunk in chunks})
        yield f"\n\n__SOURCES__:{json.dumps({'sources': sources})}"

        if not chunks and (
            botObject.hr_contact_name
            or botObject.hr_contact_email
            or botObject.hr_contact_slack
        ):
            async with AsyncSessionLocal() as fallback_db:
                result = await fallback_db.execute(
                    select(Message)
                    .where(Message.conversation_id == conversation.id)
                    .where(Message.role == "user")
                    .order_by(Message.created_at.desc())
                    .limit(1)
                )
                user_flagged_message = result.scalar_one_or_none()
                if user_flagged_message:
                    user_flagged_message.had_fallback = True
                    await fallback_db.commit()

            hr = {
                "name": botObject.hr_contact_name,
                "email": botObject.hr_contact_email,
                "slack": botObject.hr_contact_slack,
            }
            yield f"\n\n__HR_CONTACT__:{json.dumps(hr)}"

        async with AsyncSessionLocal() as save_db:
            assistant_message = Message(
                conversation_id=str(conversation.id),
                role="assistant",
                content=full_response,
            )
            save_db.add(assistant_message)
            await save_db.commit()

    return StreamingResponse(stream_and_save(), media_type="text/plain")
