# Architecture

System design overview and the reasoning behind major technical decisions.

---

## How the System Works

```
Browser
  ↕  HTTP
Next.js on Vercel        → pages, components, UI
  ↕  fetch() + Bearer token
FastAPI on Railway       → AI logic, auth validation, data
  ↕                ↕               ↕
PostgreSQL        Cloudflare R2    OpenAI API
+ pgvector        (file storage)   (embeddings + chat)
(Railway)
```

---

## Service Responsibilities

| Service                   | Responsibility                                                                 |
| ------------------------- | ------------------------------------------------------------------------------ |
| **Next.js**               | Everything the user sees. Pages, forms, chat UI, dashboard                     |
| **FastAPI**               | All backend logic. Auth, file handling, AI pipeline, DB queries                |
| **PostgreSQL + pgvector** | Stores all data — users, bots, documents, conversations, and vector embeddings |
| **Cloudflare R2**         | Stores the actual uploaded files (PDFs, DOCX). DB only stores the file path    |
| **Clerk**                 | Handles auth entirely — signup, login, sessions, tokens                        |
| **OpenAI**                | Generates embeddings and chat responses                                        |

---

## Key Design Decisions

### Why FastAPI over Node.js for the backend?

Python has the best AI/ML ecosystem. All the critical libraries — LangChain, LlamaIndex, pgvector, PyMuPDF — are Python-first. FastAPI gives us async support and automatic API docs with minimal boilerplate.

### Why PostgreSQL + pgvector instead of a dedicated vector DB?

Pinecone and Weaviate are powerful but add another service to manage and pay for. pgvector runs inside our existing Postgres instance — one less moving part, zero extra cost. It handles millions of vectors comfortably, which is far more than we need for the MVP.

### Why Cloudflare R2 over AWS S3?

R2 is S3-compatible (same API, same boto3 SDK) but has zero egress fees. S3 charges you every time a file is downloaded. R2 doesn't. At scale this is a significant cost difference.

### Why Clerk over building auth?

Building auth correctly (password hashing, session management, email verification, OAuth) takes 2-3 weeks and is easy to get wrong. Clerk handles all of it in a day. We can always migrate off later.

### Why Railway for both backend and database?

Keeping everything on one platform simplifies deployment, billing, and networking. The backend talks to the database over Railway's private internal network — faster and free. The pgvector template solved the only reason to consider Supabase.

### Why Vercel for the frontend?

Next.js is made by Vercel. Deploying Next.js on Vercel is zero-config — connect GitHub, done. Edge functions, CDN, preview deployments all work automatically.

---

## The RAG Pipeline (Coming in Week 3)

When fully built, the AI pipeline will work like this:

```
1. User uploads PDF
       ↓
2. PyMuPDF extracts text
       ↓
3. Text is split into chunks (~600 tokens each)
       ↓
4. Each chunk is sent to OpenAI embeddings API → returns vector(1536)
       ↓
5. Chunk + vector stored in document_chunks table
       ↓
6. New hire asks a question
       ↓
7. Question is embedded → vector(1536)
       ↓
8. pgvector finds the most similar chunks (cosine similarity)
       ↓
9. Top chunks + question sent to GPT-4o
       ↓
10. Answer streamed back to the new hire
```

This is called RAG — Retrieval Augmented Generation. The AI doesn't "know" your company — it retrieves the relevant parts of your documents and uses them to answer accurately.
