from fastapi import APIRouter, Depends, HTTPException
from db.models import Bot
from db.session import get_db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/bots", tags=["bots"])


@router.get("/{bot_id}/public")
async def public_bot_info(bot_id: str, db: AsyncSession = Depends(get_db)):
    """Get public information about a bot."""
    result = await db.execute(select(Bot).where(Bot.id == bot_id))
    bot = result.scalar_one_or_none()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    return {
        "id": str(bot.id),
        "name": bot.name,
        "description": bot.description,
        "welcome_message": bot.welcome_message,
        "created_at": bot.created_at,
    }
