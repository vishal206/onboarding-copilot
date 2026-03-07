# API Endpoints

All FastAPI backend endpoints, grouped by feature.

Base URL (local): `http://localhost:8000`
Base URL (production): `https://your-app.up.railway.app`

Interactive docs: `{base_url}/docs`

---

## General

| Method | Endpoint     | Auth         | Description                     |
| ------ | ------------ | ------------ | ------------------------------- |
| GET    | `/`          | None         | Returns API running message     |
| GET    | `/health`    | None         | Server health check             |
| GET    | `/db-health` | None         | Database connection check       |
| GET    | `/me`        | Bearer token | Returns current Clerk user info |

---

## Documents

| Method | Endpoint                        | Auth   | Description                      |
| ------ | ------------------------------- | ------ | -------------------------------- |
| POST   | `/documents/upload?bot_id={id}` | None\* | Upload a PDF, DOCX, or TXT file  |
| GET    | `/documents/{bot_id}`           | None\* | List all documents for a bot     |
| DELETE | `/documents/{document_id}`      | None\* | Delete a document from DB and R2 |

\*Auth will be added in Week 2 once the bot creation flow is built.

### Upload Request

- Content-Type: `multipart/form-data`
- Query param: `bot_id` (string)
- Body: `file` (PDF, DOCX, or TXT, max 10MB)

### Upload Response

```json
{
  "id": "abc-123",
  "filename": "employee-handbook.pdf",
  "status": "uploaded",
  "size_bytes": 245760
}
```

---

## Coming Soon

| Feature   | Endpoints                                                                |
| --------- | ------------------------------------------------------------------------ |
| Bots      | POST /bots, GET /bots, GET /bots/{id}, PUT /bots/{id}, DELETE /bots/{id} |
| Chat      | POST /chat, GET /chat/{conversation_id}                                  |
| Analytics | GET /analytics/{bot_id}                                                  |
| Users     | POST /users/sync (Clerk webhook)                                         |
