"""
One-shot backfill: compute page_count for existing indexed documents
and update each bot's pages_indexed_count.

Run from the backend directory:
    python scripts/backfill_page_counts.py
"""

import asyncio
import math
from collections import defaultdict

import tiktoken
from dotenv import load_dotenv
from sqlalchemy import select, update

load_dotenv()

from db.session import AsyncSessionLocal
from db.models import Document, Bot

_enc = tiktoken.get_encoding("cl100k_base")


def _pages(text: str) -> int:
    tokens = len(_enc.encode(text))
    return math.ceil(tokens / 500) if tokens > 0 else 1


async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Document).where(
                Document.status == "indexed",
                Document.page_count == 0,
                Document.raw_text.isnot(None),
            )
        )
        docs = result.scalars().all()

        if not docs:
            print("No documents to backfill.")
            return

        print(f"Backfilling {len(docs)} document(s)…")

        bot_page_totals: dict[str, int] = defaultdict(int)

        for doc in docs:
            pages = _pages(doc.raw_text)
            doc.page_count = pages
            bot_page_totals[doc.bot_id] += pages
            print(f"  {doc.filename}: {pages} page(s)")

        await db.flush()

        for bot_id, total in bot_page_totals.items():
            bot_result = await db.execute(select(Bot).where(Bot.id == bot_id))
            bot = bot_result.scalar_one_or_none()
            if bot:
                bot.pages_indexed_count = total
                print(f"  Bot {bot_id}: pages_indexed_count → {total}")

        await db.commit()
        print("Done.")


asyncio.run(main())
