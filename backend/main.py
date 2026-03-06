import os
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import httpx

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Onboarding Co-Pilot API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

# A protected endpoint — requires a valid Clerk token
@app.get("/me")
async def get_me(authorization: str = Header(...)):
    """
    authorization header looks like: "Bearer <token>"
    We send that token to Clerk to verify it and get the user's info.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]

    # Ask Clerk to verify the token and return user info
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.clerk.com/v1/me",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
        )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return response.json()