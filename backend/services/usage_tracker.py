from db.models import UsageEvent
from db.session import AsyncSessionLocal

# Cost per 1M tokens for gpt-4o-mini (input / output)
_COST_PER_1M = {"gpt-4o-mini": (0.15, 0.60)}


async def log_usage(bot_id: str, model: str, input_tokens: int, output_tokens: int):
    input_rate, output_rate = _COST_PER_1M.get(model, (0.0, 0.0))
    cost_usd = (input_tokens * input_rate + output_tokens * output_rate) / 1_000_000

    async with AsyncSessionLocal() as db:
        event = UsageEvent(
            bot_id=bot_id,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=cost_usd,
        )
        db.add(event)
        await db.commit()
