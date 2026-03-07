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
  frontend/       → Next.js app (pages, components, UI)
  backend/        → FastAPI app (AI logic, API endpoints)
  docs/           → Dev notes and decisions
```

### Backend Structure

```
backend/
  main.py              → app setup, middleware, routes
  requirements.txt     → Python dependencies
  .env                 → secrets (never commit)
  Procfile             → Railway start command
  db/
    __init__.py
    models.py          → SQLAlchemy table definitions
    session.py         → DB engine, session, get_db dependency
  alembic/
    env.py             → migration config
    versions/          → migration files
```

---

## Database Schema

| Table             | Description                                  |
| ----------------- | -------------------------------------------- |
| `users`           | Linked to Clerk user ID                      |
| `bots`            | Each HR team's AI assistant                  |
| `documents`       | Uploaded files per bot                       |
| `document_chunks` | Parsed + chunked text with vector embeddings |
| `conversations`   | Chat sessions per bot                        |
| `messages`        | Individual messages in each conversation     |

---

## Getting Started

### Prerequisites

- Node.js v20+
- Python 3.9+
- A Clerk account (clerk.com)
- A Railway account (railway.app)

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # add your Clerk keys
npm run dev                         # runs on http://localhost:3000
```

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                # add your keys
uvicorn main:app --reload           # runs on http://localhost:8000
```

### Run Migrations

```bash
cd backend
source venv/bin/activate
alembic upgrade head
```

### Environment Variables

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
```

---

## API Endpoints

| Method | Endpoint     | Auth         | Description                     |
| ------ | ------------ | ------------ | ------------------------------- |
| GET    | `/`          | None         | Health check                    |
| GET    | `/health`    | None         | Server status                   |
| GET    | `/db-health` | None         | Database connection check       |
| GET    | `/me`        | Bearer token | Returns current user from Clerk |

---

## Routes

| Route           | Access    | Description                      |
| --------------- | --------- | -------------------------------- |
| `/`             | Public    | Landing page                     |
| `/sign-in`      | Public    | Login                            |
| `/sign-up`      | Public    | Register                         |
| `/dashboard`    | Protected | HR dashboard                     |
| `/chat/[botId]` | Public    | New hire chat link (coming soon) |

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
- [x] Database schema with 6 tables
- [x] Alembic migrations
- [x] FastAPI connected to database
- [ ] Cloudflare R2 file storage
- [ ] Document upload pipeline
- [ ] RAG chat engine
- [ ] HR analytics dashboard
- [ ] Stripe billing
