# Uploads Endpoints

Base path: `/uploads`

All endpoints require `Authorization: Bearer <access_token>`.

Supported file types: **JPEG, PNG, WebP, PDF**
Max file size: **10 MB**

---

## POST /uploads

Upload a file to Cloudflare R2. Returns the saved file record including the public URL. Use the returned `id` to link a file to your profile (e.g. `profile_picture_id`, `cac_document_id`).

**Auth required:** Yes (any role)

**Request:** `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| file | File | Yes | JPEG / PNG / WebP / PDF, max 10 MB |
| purpose | string | No | `profile_picture` \| `cac_document` \| `drivers_license` \| `other`. Defaults to `other` |

**Example (curl):**
```bash
curl -X POST http://localhost:3000/uploads \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/photo.jpg" \
  -F "purpose=profile_picture"
```

**Response 201:**
```json
{
  "message": "File uploaded successfully.",
  "data": {
    "id": 12,
    "user_id": 5,
    "file_key": "5/profile_picture/1714000000000-x7k2m.jpg",
    "file_url": "https://pub.r2.example.com/5/profile_picture/1714000000000-x7k2m.jpg",
    "file_name": "photo.jpg",
    "file_type": "image/jpeg",
    "file_size": 204800,
    "purpose": "profile_picture",
    "created_at": "2026-04-24T10:00:00.000Z"
  },
  "success": true
}
```

**Errors:**
- `400` — No file provided / unsupported file type / file too large
- `401` — Not authenticated

---

## DELETE /uploads/:id

Delete a file from R2 and remove the metadata record. Only the owner of the file can delete it.

**Auth required:** Yes (any role)

**Path params:**

| Param | Type | Notes |
|---|---|---|
| id | number | File ID from the upload response |

**Response 200:**
```json
{
  "message": "File deleted successfully.",
  "success": true
}
```

**Errors:**
- `401` — Not authenticated
- `403` — You do not own this file
- `404` — File not found
