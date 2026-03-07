# Authentication

How auth works in this project and every gotcha we hit with Clerk.

---

## How It Works

Clerk handles the entire auth flow. Here's what happens end to end:

```
1. User signs up on /sign-up (Clerk UI component)
2. Clerk creates the user and issues a session token
3. User is redirected to /dashboard
4. Every request to FastAPI includes the token in the Authorization header
5. FastAPI calls Clerk's API to verify the token and get user info
6. Clerk webhook fires → creates a matching user row in our PostgreSQL DB
```

---

## Middleware — Route Protection

`frontend/middleware.ts` runs before every page load and blocks unauthenticated users from protected routes.

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});
```

---

## ClerkProvider Setup

Set redirect URLs directly in the component — don't rely on env variables alone:

```tsx
// app/layout.tsx
<ClerkProvider
  signInUrl="/sign-in"
  signUpUrl="/sign-up"
  signInFallbackRedirectUrl="/dashboard"
  signUpFallbackRedirectUrl="/dashboard"
>
```

---

## Frontend → Backend Token Flow

```ts
// In any Next.js Client Component
const { getToken } = useAuth();
const token = await getToken();

fetch("https://your-api.railway.app/bots", {
  headers: { Authorization: `Bearer ${token}` },
});
```

```python
# In FastAPI — verifying the token
async with httpx.AsyncClient() as client:
    response = await client.get(
        "https://api.clerk.com/v1/me",
        headers={"Authorization": f"Bearer {token}"}
    )
```

---

## Version Gotchas

Clerk's API changed significantly in recent versions. These are the fixes:

| What broke             | Wrong way             | Correct way                |
| ---------------------- | --------------------- | -------------------------- |
| Middleware protect     | `auth().protect()`    | `await auth.protect()`     |
| UserButton redirect    | `afterSignOutUrl="/"` | Just use `<UserButton />`  |
| After sign-in redirect | env vars only         | Set in ClerkProvider props |

---

## Creating Auth Page Folders on Mac

The `[[...sign-in]]` catch-all folder syntax requires quotes on Mac — backslashes don't work:

```bash
# ✅ Correct
mkdir -p "app/sign-in/[[...sign-in]]"
mkdir -p "app/sign-up/[[...sign-up]]"

# ❌ Wrong — doesn't create the folder
mkdir -p app/sign-in/\[\[...sign-in\]\]
```

**Why the weird folder name?** Clerk's sign-in flow has multiple internal steps (`/factor-one`, `/sso-callback`, etc.). The `[[...sign-in]]` catch-all matches all of them with one page file.

---

## Environment Variables

```bash
# frontend/.env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# backend/.env
CLERK_SECRET_KEY=sk_test_...
```
