from fastapi import APIRouter, Request, HTTPException, Header
from svix.webhooks import Webhook, WebhookVerificationError
from sqlalchemy import select
from db.session import AsyncSessionLocal
from db.models import User
import os

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")


@router.post("/clerk")
async def clerk_webhook(
    request: Request,
    svix_id: str = Header(None),
    svix_timestamp: str = Header(None),
    svix_signature: str = Header(None),
):
    payload = await request.body()

    # Verify the webhook signature
    try:
        wh = Webhook(CLERK_WEBHOOK_SECRET)
        event = wh.verify(
            payload,
            {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            },
        )
    except WebhookVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    # Handle user.created event
    if event["type"] == "user.created":
        data = event["data"]
        clerk_user_id = data["id"]
        email = data["email_addresses"][0]["email_address"]

        async with AsyncSessionLocal() as session:
            # Check if user already exists
            result = await session.execute(
                select(User).where(User.clerk_user_id == clerk_user_id)
            )
            existing = result.scalar_one_or_none()

            if not existing:
                new_user = User(
                    clerk_user_id=clerk_user_id,
                    email=email,
                )
                session.add(new_user)
                await session.commit()

    return {"status": "ok"}
