# Dev Notes

Technical decisions, gotchas, and fixes encountered during development.

---

## Setup

- **Package manager:** npm (frontend), pip with venv (backend)
- **Python virtual environment:** Always activate with `source venv/bin/activate` before working on the backend
- **Ports:** Frontend on `3000`, Backend on `8000`

---

## Authentication (Clerk)

**Version gotchas — Clerk's API changed in recent versions:**

1. **Middleware protect()** — the correct syntax in the current version is:

   ```ts
   export default clerkMiddleware(async (auth, req) => {
     if (isProtectedRoute(req)) {
       await auth.protect(); // not auth().protect()
     }
   });
   ```

2. **UserButton redirect prop** — `afterSignOutUrl` no longer exists. Just use `<UserButton />` with no props — it redirects to `/` by default.

3. **ClerkProvider redirects** — env variables alone may not be picked up reliably. Set redirects directly in the component to be safe:

   ```tsx
   <ClerkProvider
     signInUrl="/sign-in"
     signUpUrl="/sign-up"
     signInFallbackRedirectUrl="/dashboard"
     signUpFallbackRedirectUrl="/dashboard"
   >
   ```

4. **Sign-in/up page folders** — use quotes, not backslashes, when creating the catch-all route folders on Mac:
   ```bash
   mkdir -p "sign-in/[[...sign-in]]"
   mkdir -p "sign-up/[[...sign-up]]"
   ```

**Why `[[...sign-in]]` folder name?**
Clerk's sign-in flow has multiple internal steps (`/factor-one`, `/sso-callback`, etc.) all handled by one `<SignIn />` component. The double-bracket catch-all folder catches all those sub-routes automatically.

---

## Frontend → Backend Auth

The frontend gets a session token from Clerk and passes it in the `Authorization` header:

```ts
const token = await getToken();
fetch("http://localhost:8000/me", {
  headers: { Authorization: `Bearer ${token}` },
});
```

The FastAPI backend verifies the token by calling Clerk's API:

```python
async with httpx.AsyncClient() as client:
    response = await client.get(
        "https://api.clerk.com/v1/me",
        headers={"Authorization": f"Bearer {token}"}
    )
```

---

## Database (PostgreSQL + pgvector)

**Stack decision:** PostgreSQL 17 + pgvector on Railway using the `pgvector-pg17` template.

**Why not plain Railway PostgreSQL?**
Railway's default Postgres is version 17 but doesn't include pgvector. The `pgvector-pg17` template has it pre-installed.

**Why not Supabase?**
Keeping everything on Railway is simpler — one platform, one bill. The pgvector template solved the only reason to consider Supabase.

**SSL gotcha:**

- Railway's plain Postgres requires `ssl='require'`
- The pgvector template does NOT use SSL — remove `connect_args={"ssl": "require"}` from both `db/session.py` and `alembic/env.py`

**Connection URLs:**

- `DATABASE_URL` (internal) — only works inside Railway, use for production
- `DATABASE_PUBLIC_URL` — works from your local Mac, use for local dev
- Always replace `postgresql://` with `postgresql+asyncpg://` for SQLAlchemy async

**Alembic gotchas:**

1. Missing `greenlet` package on Python 3.9 — fix: `pip install greenlet`
2. Auto-generated migration missing pgvector import — add `import pgvector.sqlalchemy` at top of migration file
3. pgvector extension not enabled — add `op.execute('CREATE EXTENSION IF NOT EXISTS vector')` as first line of `upgrade()` in migration file

---

## Railway Deployment

- Set **Root Directory** to `backend` in Railway service settings
- Add a `Procfile` in `backend/`: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
- Generate a public domain under Settings → Networking → Generate Domain
- Use internal `DATABASE_URL` for Railway → Railway communication (faster, free)
- Use `DATABASE_PUBLIC_URL` in local `.env` for development

---

## Environment Variables

- **Never commit** `.env` or `.env.local` — both are in `.gitignore`
- Next.js only reads `.env.local` on server start — restart after any changes
- `NEXT_PUBLIC_` prefix = safe to expose in browser. Without it = server only

---

## Next Up

- Day 4: Cloudflare R2 file storage setup
- Day 5: Connect everything + Clerk webhook → DB sync
