import stripe
import os
from fastapi import APIRouter, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Depends
from db.session import get_db
from db.models import User

router = APIRouter(prefix="/billing", tags=["billing"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    # 1. Get the raw body — must be raw bytes, not parsed JSON
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    # 2. Verify the webhook signature
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception:
        raise HTTPException(status_code=400, detail="Webhook error")

    # 3. Handle the events
    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        # Payment succeeded — upgrade the user's plan
        clerk_user_id = data.get("metadata", {}).get("clerk_user_id")
        plan = data.get("metadata", {}).get("plan")  # e.g. "starter", "growth", "scale"
        stripe_customer_id = data.get("customer")

        if clerk_user_id:
            result = await db.execute(select(User).where(User.id == clerk_user_id))
            user = result.scalar_one_or_none()
            if user:
                user.plan = plan
                user.stripe_customer_id = stripe_customer_id
                await db.commit()

    elif event_type == "customer.subscription.deleted":
        # Subscription cancelled — downgrade user to free
        stripe_customer_id = data.get("customer")

        result = await db.execute(
            select(User).where(User.stripe_customer_id == stripe_customer_id)
        )
        user = result.scalar_one_or_none()
        if user:
            user.plan = "free"
            await db.commit()

    # 4. Always return 200 — even for unhandled event types
    return {"status": "ok"}


@router.post("/create-checkout")
async def create_checkout_session(request: Request):
    # Placeholder — will build this on Day 2
    return {"message": "coming soon"}


@router.post("/portal")
async def customer_portal(request: Request):
    # Placeholder — will build this on Day 2
    return {"message": "coming soon"}
