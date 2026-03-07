# Onboarding Co-Pilot

An AI-powered onboarding assistant. HR teams upload their documents and policies — new hires get an instant 24/7 Q&A bot that answers their questions accurately.

---

## What It Does

- HR uploads onboarding docs, handbooks, and SOPs
- AI indexes the documents and makes them searchable
- New hires get a shareable chat link — no account needed
- HR dashboard tracks conversations and surfaces common questions

---

## Tech Stack

| Layer            | Technology                               |
| ---------------- | ---------------------------------------- |
| Frontend         | Next.js 14, Tailwind CSS, TypeScript     |
| Auth             | Clerk                                    |
| Backend          | Python, FastAPI                          |
| Database         | PostgreSQL 17 + pgvector 0.8.2 (Railway) |
| File Storage     | Cloudflare R2                            |
| AI               | OpenAI API                               |
| Frontend Hosting | Vercel                                   |
| Backend Hosting  | Railway                                  |

---

## Project Structure

```
onboarding-copilot/
  frontend/         → Next.js app
  backend/          → FastAPI app
  docs/             → Architecture, setup guides, and decision notes
```

### Backend Structure

```
backend/
  main.py              → app entry point, middleware, router registration
  requirements.txt     → Python dependencies
  .env                 → secrets (never commit)
  Procfile             → Railway start command
  db/
    models.py          → SQLAlchemy table definitions
    session.py         → DB engine, session, get_db dependency
  services/
    storage.py         → Cloudflare R2 upload/download/delete
  routers/
    documents.py       → document upload, list, delete endpoints
  alembic/
    env.py             → migration config
    versions/          → migration files
```

### Frontend Structure

```
frontend/
  app/
    page.tsx                        → public landing page
    layout.tsx                      → ClerkProvider root layout
    sign-in/[[...sign-in]]/page.tsx → Clerk sign-in
    sign-up/[[...sign-up]]/page.tsx → Clerk sign-up
    dashboard/page.tsx              → protected HR dashboard
  middleware.ts                     → route protection
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- Python 3.9+
- Clerk account (clerk.com)
- Railway account (railway.app)
- Cloudflare account (cloudflare.com)

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev                    # http://localhost:3000
```

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload      # http://localhost:8000
```

### Run Migrations

```bash
cd backend
source venv/bin/activate
alembic upgrade head
```

---

## Environment Variables

**frontend/.env.local**

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

**backend/.env**

```
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql+asyncpg://postgres:password@host:port/railway
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT_URL=https://your_account_id.r2.cloudflarestorage.com
R2_BUCKET_NAME=onboarding-copilot-docs
```

---

## Current Status

- [x] Project structure and monorepo setup
- [x] Next.js frontend with Tailwind CSS
- [x] FastAPI backend with CORS
- [x] Deployed backend to Railway
- [x] Clerk authentication (signup, login, logout)
- [x] Protected dashboard route with middleware
- [x] Frontend → Backend token verification
- [x] PostgreSQL 17 + pgvector 0.8.2 on Railway
- [x] Database schema with 6 tables + Alembic migrations
- [x] FastAPI connected to database
- [x] Cloudflare R2 file storage
- [x] Document upload, list, delete endpoints
- [ ] Clerk webhook → sync users to DB
- [ ] Document parsing pipeline
- [ ] RAG chat engine
- [ ] HR analytics dashboard
- [ ] Stripe billing

---

## Docs

Detailed notes on every part of the system — decisions made, gotchas hit, and how things work.

| Doc                                                                                            | What's inside                                                 |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [Architecture](https://github.com/vishal206/onboarding-copilot/blob/main/docs/architecture.md) | System design, how services connect, why each tech was chosen |
| [Auth](https://github.com/vishal206/onboarding-copilot/blob/main/docs/auth.md)                 | Clerk setup, middleware, token flow, version gotchas          |
| [Database](https://github.com/vishal206/onboarding-copilot/blob/main/docs/database.md)         | Schema, pgvector, Alembic migrations, connection URLs         |
| [Storage](https://github.com/vishal206/onboarding-copilot/blob/main/docs/storage.md)           | Cloudflare R2 setup, file naming, signed URLs                 |
| [Deployment](https://github.com/vishal206/onboarding-copilot/blob/main/docs/deployment.md)     | Railway config, environment variables, SSL notes              |
| [API](https://github.com/vishal206/onboarding-copilot/blob/main/docs/api.md)                   | All endpoints — current and coming soon                       |
