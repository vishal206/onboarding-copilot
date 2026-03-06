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

## Environment Variables

- **Never commit** `.env` or `.env.local` — both are in `.gitignore`
- Next.js only reads `.env.local` on server start — restart after any changes
- `NEXT_PUBLIC_` prefix = safe to expose in browser. Without it = server only

---

## Next Up

- Day 3: PostgreSQL schema + pgvector setup + SQLAlchemy models
- Day 4: Cloudflare R2 file storage
- Day 5: Connect everything + Clerk webhook → DB sync
