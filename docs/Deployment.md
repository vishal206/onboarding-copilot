# Deployment

How the backend is deployed on Railway and key things to know.

---

## Services on Railway

| Service                       | What it is                        |
| ----------------------------- | --------------------------------- |
| `onboarding-copilot` (GitHub) | Your FastAPI backend              |
| `pgvector`                    | PostgreSQL 17 + pgvector database |

---

## Backend Deployment

Railway auto-deploys from GitHub on every push to `main`.

**Key settings:**

- **Root Directory:** `backend` — Railway only looks in this folder
- **Start command** (via Procfile): `uvicorn main:app --host 0.0.0.0 --port $PORT`

The `$PORT` is set automatically by Railway. Always use it — hardcoding a port will break the deployment.

**Procfile** (`backend/Procfile`):

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## Environment Variables on Railway

Set these in Railway → your backend service → **Variables** tab:

```
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql+asyncpg://postgres:pass@postgres.railway.internal:5432/railway
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT_URL=https://your_account_id.r2.cloudflarestorage.com
R2_BUCKET_NAME=onboarding-copilot-docs
```

**Important:** Use the **internal** `DATABASE_URL` (not the public one) for production. It uses Railway's private network — faster and free bandwidth.

---

## Database Connection URLs

| Variable              | Value                                         | Use for                        |
| --------------------- | --------------------------------------------- | ------------------------------ |
| `DATABASE_URL`        | `postgresql+asyncpg://...railway.internal...` | Production (Railway → Railway) |
| `DATABASE_PUBLIC_URL` | `postgresql+asyncpg://...proxy.rlwy.net...`   | Local development              |

In your local `backend/.env`, use `DATABASE_PUBLIC_URL` value as `DATABASE_URL`.

---

## Getting Your Public Backend URL

Railway → your backend service → **Settings** → **Networking** → **Generate Domain**

Looks like: `https://onboarding-copilot-production.up.railway.app`

Save this as `NEXT_PUBLIC_API_URL` in your frontend `.env.local`.

---

## SSL Notes

- Railway plain Postgres: requires `ssl='require'`
- Railway pgvector template: does **not** use SSL — no `connect_args` needed
- Current setup uses pgvector template → no SSL config in `db/session.py` or `alembic/env.py`
