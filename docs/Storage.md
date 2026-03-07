# File Storage

Cloudflare R2 setup, how files are stored, and how the storage service works.

---

## Why Cloudflare R2

- **S3-compatible** — uses the exact same API as Amazon S3, so we use boto3 (Amazon's SDK) to talk to it
- **Zero egress fees** — S3 charges you every time a file is downloaded. R2 doesn't. Significant cost saving at scale.
- **Free tier** — 10GB storage and 1 million requests/month free

---

## Setup

1. Cloudflare → R2 Object Storage → Create bucket: `onboarding-copilot-docs`
2. R2 → Manage R2 API Tokens → Create API Token
   - Type: **Account API Token** (not User API Token)
   - Permissions: Object Read & Write
3. Copy the three values shown (only shown once):
   - Access Key ID
   - Secret Access Key
   - Endpoint URL: `https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com`

---

## How Files Are Stored

Files are stored with a structured key (path) so they're organised by bot:

```
onboarding-copilot-docs/
  bot_id_123/
    a1b2c3d4_employee-handbook.pdf
    e5f6g7h8_benefits-guide.docx
  bot_id_456/
    i9j0k1l2_onboarding-checklist.pdf
```

**Format:** `{bot_id}/{unique_id}_{original_filename}`

The `file_url` column in the `documents` table stores just the R2 key (the path above), not a full URL. Full URLs are generated on demand as signed URLs.

---

## Signed URLs

The R2 bucket is **private** — files can't be accessed directly via a URL. When a user needs to view a file, we generate a signed URL that expires after 1 hour:

```python
url = get_signed_url("bot_id_123/a1b2c3d4_handbook.pdf", expiry_seconds=3600)
# Returns a temporary URL like:
# https://onboarding-copilot-docs.account.r2.cloudflarestorage.com/bot_id_123/...?X-Amz-Expires=3600&...
```

---

## Storage Service (`services/storage.py`)

| Function                                     | What it does                                  |
| -------------------------------------------- | --------------------------------------------- |
| `upload_file(bytes, filename, content_type)` | Uploads a file to R2, returns the storage key |
| `get_signed_url(filename, expiry_seconds)`   | Returns a temporary access URL                |
| `delete_file(filename)`                      | Permanently deletes a file from R2            |

---

## Allowed File Types

| MIME Type                                                                 | Extension |
| ------------------------------------------------------------------------- | --------- |
| `application/pdf`                                                         | .pdf      |
| `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | .docx     |
| `text/plain`                                                              | .txt      |

Maximum file size: **10MB**

---

## Environment Variables

```bash
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_ENDPOINT_URL=https://your_account_id.r2.cloudflarestorage.com
R2_BUCKET_NAME=onboarding-copilot-docs
```

---

## API Endpoints

| Method | Endpoint                       | Description                  |
| ------ | ------------------------------ | ---------------------------- |
| POST   | `/documents/upload?bot_id=xxx` | Upload a file                |
| GET    | `/documents/{bot_id}`          | List all documents for a bot |
| DELETE | `/documents/{document_id}`     | Delete a document            |

---

## Testing Uploads Locally

1. Start the backend: `uvicorn main:app --reload`
2. Visit `http://localhost:8000/docs`
3. Find `POST /documents/upload`
4. Click **Try it out** → enter a `bot_id` → choose a PDF file → Execute
5. Verify the file appears in your Cloudflare R2 bucket dashboard
