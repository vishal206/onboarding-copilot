from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from db.models import Bot, Conversation, Message
from db.session import get_db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/bots", tags=["bots"])


class HRContactUpdate(BaseModel):
    hr_contact_name: Optional[str] = None
    hr_contact_email: Optional[str] = None
    hr_contact_slack: Optional[str] = None


class BotUpdate(BaseModel):
    name: Optional[str] = None
    welcome_message: Optional[str] = None
    system_prompt: Optional[str] = None
    hr_contact_name: Optional[str] = None
    hr_contact_email: Optional[str] = None
    hr_contact_slack: Optional[str] = None


@router.get("/{bot_id}")
async def get_bot(bot_id: str, db: AsyncSession = Depends(get_db)):
    """Get full bot configuration."""
    result = await db.execute(select(Bot).where(Bot.id == bot_id))
    bot = result.scalar_one_or_none()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    return {
        "id": str(bot.id),
        "name": bot.name,
        "welcome_message": bot.welcome_message,
        "system_prompt": bot.system_prompt,
        "hr_contact_name": bot.hr_contact_name,
        "hr_contact_email": bot.hr_contact_email,
        "hr_contact_slack": bot.hr_contact_slack,
        "is_active": bot.is_active,
        "created_at": bot.created_at,
    }


@router.patch("/{bot_id}")
async def update_bot(bot_id: str, body: BotUpdate, db: AsyncSession = Depends(get_db)):
    """Update bot configuration."""
    result = await db.execute(select(Bot).where(Bot.id == bot_id))
    bot = result.scalar_one_or_none()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")

    if body.name is not None:
        bot.name = body.name
    if body.welcome_message is not None:
        bot.welcome_message = body.welcome_message
    if body.system_prompt is not None:
        bot.system_prompt = body.system_prompt
    if body.hr_contact_name is not None:
        bot.hr_contact_name = body.hr_contact_name
    if body.hr_contact_email is not None:
        bot.hr_contact_email = body.hr_contact_email
    if body.hr_contact_slack is not None:
        bot.hr_contact_slack = body.hr_contact_slack

    await db.commit()
    await db.refresh(bot)

    return {
        "id": str(bot.id),
        "name": bot.name,
        "welcome_message": bot.welcome_message,
        "system_prompt": bot.system_prompt,
        "hr_contact_name": bot.hr_contact_name,
        "hr_contact_email": bot.hr_contact_email,
        "hr_contact_slack": bot.hr_contact_slack,
    }


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
        "welcome_message": bot.welcome_message,
        "created_at": bot.created_at,
    }


@router.get("/{bot_id}/fallbacks")
async def get_fallback_messages(bot_id: str, db: AsyncSession = Depends(get_db)):
    """Helper function to get fallback messages for a bot."""
    result = await db.execute(
        select(Message)
        .join(Conversation)
        .where(Conversation.bot_id == bot_id)
        .where(Message.had_fallback == True)
    )
    messages = result.scalars().all()
    return [
        {
            "conversation_id": str(message.conversation_id),
            "content": message.content,
            "created_at": message.created_at,
        }
        for message in messages
    ]


@router.get("/{bot_id}/hr-contact")
async def get_hr_contact(bot_id: str, db: AsyncSession = Depends(get_db)):
    """Get HR contact info for a bot."""
    result = await db.execute(select(Bot).where(Bot.id == bot_id))
    bot = result.scalar_one_or_none()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    return {
        "hr_contact_name": bot.hr_contact_name,
        "hr_contact_email": bot.hr_contact_email,
        "hr_contact_slack": bot.hr_contact_slack,
    }


@router.patch("/{bot_id}/hr-contact")
async def update_hr_contact(
    bot_id: str, body: HRContactUpdate, db: AsyncSession = Depends(get_db)
):
    """Update HR contact info for a bot."""
    result = await db.execute(select(Bot).where(Bot.id == bot_id))
    bot = result.scalar_one_or_none()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")

    bot.hr_contact_name = body.hr_contact_name
    bot.hr_contact_email = body.hr_contact_email
    bot.hr_contact_slack = body.hr_contact_slack
    await db.commit()
    await db.refresh(bot)

    return {
        "hr_contact_name": bot.hr_contact_name,
        "hr_contact_email": bot.hr_contact_email,
        "hr_contact_slack": bot.hr_contact_slack,
    }
