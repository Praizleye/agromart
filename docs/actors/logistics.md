# Logistics Endpoints

Base path: `/logistics`

All endpoints require:
- `Authorization: Bearer <access_token>`
- Role: `logistics`

Logistics (delivery) users are invite-only. They complete registration via `POST /auth/complete-invite` then manage their vehicle profile here.

---

## GET /logistics/profile

Fetch the authenticated logistics user's full profile. Creates an empty extended profile record on first call if one does not exist.

**Response 200:**
```json
{
  "message": "Profile fetched successfully.",
  "data": {
    "id": 8,
    "first_name": "Chidi",
    "last_name": "Okafor",
    "email": "chidi@example.com",
    "phone": "08055667788",
    "role": "logistics",
    "is_active": true,
    "is_email_verified": true,
    "profile": {
      "id": 6,
      "user_id": 8,
      "profile_picture_id": 20,
      "metadata": {
        "vehicle_type": "Truck",
        "plate_number": "ABC-123-DE",
        "license_number": "NG-LIC-987654",
        "license_document_id": 21
      },
      "profile_picture": {
        "id": 20,
        "file_url": "https://pub.r2.example.com/8/profile_picture/...",
        "file_name": "chidi.jpg"
      }
    }
  },
  "success": true
}
```

---

## PATCH /logistics/profile

Update the logistics user's vehicle and license profile. All fields are optional — only provided fields are updated (merged into existing metadata).

To attach a file (e.g. driver's license or profile picture), first upload via `POST /uploads` and use the returned `id`.

**Request body:**
```json
{
  "vehicle_type": "Truck",
  "plate_number": "ABC-123-DE",
  "license_number": "NG-LIC-987654",
  "license_document_id": 21,
  "profile_picture_id": 20
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| vehicle_type | string | No | e.g. Truck, Motorcycle, Van |
| plate_number | string | No | Vehicle plate number |
| license_number | string | No | Driver's license number |
| license_document_id | number | No | File ID from `POST /uploads` with `purpose: "drivers_license"` |
| profile_picture_id | number | No | File ID from `POST /uploads` with `purpose: "profile_picture"` |

**Response 200:**
```json
{
  "message": "Profile updated successfully.",
  "data": {
    "id": 6,
    "user_id": 8,
    "profile_picture_id": 20,
    "metadata": {
      "vehicle_type": "Truck",
      "plate_number": "ABC-123-DE",
      "license_number": "NG-LIC-987654",
      "license_document_id": 21
    }
  },
  "success": true
}
```

**Errors:**
- `400` — Validation error (e.g. non-integer file ID)
- `401` — Not authenticated
- `403` — Role is not `logistics`
