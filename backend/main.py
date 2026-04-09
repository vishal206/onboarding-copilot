import os
import httpx
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from dotenv import load_dotenv
from routers import documents, webhooks, query, bots


from db.session import get_db

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)
app.include_router(webhooks.router)
app.include_router(query.router)
app.include_router(bots.router)


@app.get("/")
def root():
    return {"message": "Onboarding Co-Pilot API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/db-health")
async def db_health(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT 1"))
    return {"database": "connected", "result": result.scalar()}


@app.get("/me")
async def get_me(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ")[1]
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.clerk.com/v1/me", headers={"Authorization": f"Bearer {token}"}
        )
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return response.json()
