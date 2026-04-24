# Aggregator Endpoints

Base path: `/aggregator`

All endpoints require:
- `Authorization: Bearer <access_token>`
- Role: `aggregator`

Aggregators are invite-only. They complete registration via `POST /auth/complete-invite` then manage their business profile here.

---

## GET /aggregator/profile

Fetch the authenticated aggregator's full profile. Creates an empty extended profile record on first call if one does not exist.

**Response 200:**
```json
{
  "message": "Profile fetched successfully.",
  "data": {
    "id": 5,
    "first_name": "Bob",
    "last_name": "Jones",
    "email": "bob@example.com",
    "phone": "08011223344",
    "role": "aggregator",
    "is_active": true,
    "is_email_verified": true,
    "profile": {
      "id": 3,
      "user_id": 5,
      "profile_picture_id": 12,
      "metadata": {
        "business_name": "FreshFarms Ltd",
        "business_address": "12 Lagos Road",
        "cac_number": "RC-123456",
        "city": "Lagos",
        "state": "Lagos",
        "cac_document_id": 15
      },
      "profile_picture": {
        "id": 12,
        "file_url": "https://pub.r2.example.com/5/profile_picture/...",
        "file_name": "photo.jpg"
      }
    }
  },
  "success": true
}
```

---

## PATCH /aggregator/profile

Update the aggregator's business profile. All fields are optional — only provided fields are updated (merged into existing metadata).

To attach a file (e.g. CAC document or profile picture), first upload via `POST /uploads` and use the returned `id`.

**Request body:**
```json
{
  "business_name": "FreshFarms Ltd",
  "business_address": "12 Lagos Road",
  "cac_number": "RC-123456",
  "city": "Lagos",
  "state": "Lagos",
  "cac_document_id": 15,
  "profile_picture_id": 12
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| business_name | string | No | |
| business_address | string | No | |
| cac_number | string | No | CAC registration number |
| city | string | No | |
| state | string | No | |
| cac_document_id | number | No | File ID from `POST /uploads` with `purpose: "cac_document"` |
| profile_picture_id | number | No | File ID from `POST /uploads` with `purpose: "profile_picture"` |

**Response 200:**
```json
{
  "message": "Profile updated successfully.",
  "data": {
    "id": 3,
    "user_id": 5,
    "profile_picture_id": 12,
    "metadata": {
      "business_name": "FreshFarms Ltd",
      "business_address": "12 Lagos Road",
      "cac_number": "RC-123456",
      "city": "Lagos",
      "state": "Lagos",
      "cac_document_id": 15
    }
  },
  "success": true
}
```

**Errors:**
- `400` — Validation error (e.g. non-integer file ID)
- `401` — Not authenticated
- `403` — Role is not `aggregator`
