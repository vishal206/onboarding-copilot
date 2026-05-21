import math
import tiktoken
from services.embedder import Embedder
from services.chunker import Chunker
from db.models import Document, Bot, User
from db.session import AsyncSessionLocal
from plan_limits import PLAN_LIMITS
from sqlalchemy import select

_enc = tiktoken.get_encoding("cl100k_base")


def _token_count(text: str) -> int:
    return len(_enc.encode(text))


async def process_document(document_id: str):
    async with AsyncSessionLocal() as db:
        doc = await db.get(Document, document_id)
        if not doc:
            return

        try:
            # Compute page_count before indexing so we can enforce the limit
            token_count = _token_count(doc.raw_text or "")
            page_count = math.ceil(token_count / 500) if token_count > 0 else 1

            # Enforce plan pages limit
            bot_result = await db.execute(select(Bot).where(Bot.id == doc.bot_id))
            bot = bot_result.scalar_one_or_none()
            if bot:
                user_result = await db.execute(select(User).where(User.id == bot.user_id))
                user = user_result.scalar_one_or_none()
                plan = (user.plan if user else None) or "free"
                limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
                max_pages = limits["max_pages_indexed"]
                if bot.pages_indexed_count + page_count > max_pages:
                    doc.status = "limit_exceeded"
                    await db.commit()
                    return

            chunks = Chunker(doc.raw_text).chunk()
            embeddings = Embedder(chunks).embed()

            from db.models import DocumentChunk
            for idx, chunk in enumerate(chunks):
                chunk_record = DocumentChunk(
                    document_id=document_id,
                    content=chunk,
                    chunk_index=idx,
                    embedding=embeddings[idx],
                )
                db.add(chunk_record)

            doc.status = "indexed"
            doc.page_count = page_count

            if bot:
                bot.pages_indexed_count += page_count

            await db.commit()
        except Exception:
            doc.status = "indexing failed"
            await db.commit()
