# User Endpoints

Base path: `/user`

All endpoints require:
- `Authorization: Bearer <access_token>`
- Role: `user`

Normal users self-register via `POST /auth/register` and verify their email via `POST /auth/verify-email`.

---

## GET /user/profile

Fetch the authenticated user's full profile. Creates an empty extended profile record on first call if one does not exist.

**Response 200:**
```json
{
  "message": "Profile fetched successfully.",
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "08012345678",
    "role": "user",
    "is_active": true,
    "is_email_verified": true,
    "profile": {
      "id": 1,
      "user_id": 1,
      "profile_picture_id": null,
      "metadata": {
        "address": "5 Banana Island",
        "city": "Lagos",
        "state": "Lagos"
      },
      "profile_picture": null
    }
  },
  "success": true
}
```

---

## PATCH /user/profile

Update the user's personal profile. All fields are optional. `phone` and `country_code` are saved directly on the users table; all other fields are stored in extended profile metadata.

**Request body:**
```json
{
  "phone": "08012345678",
  "country_code": "234",
  "address": "5 Banana Island",
  "city": "Lagos",
  "state": "Lagos",
  "profile_picture_id": 9
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| phone | string | No | Saved to users table |
| country_code | string | No | Saved to users table |
| address | string | No | Saved in metadata |
| city | string | No | Saved in metadata |
| state | string | No | Saved in metadata |
| profile_picture_id | number | No | File ID from `POST /uploads` with `purpose: "profile_picture"` |

**Response 200:**
```json
{
  "message": "Profile updated successfully.",
  "data": {
    "id": 1,
    "user_id": 1,
    "profile_picture_id": 9,
    "metadata": {
      "address": "5 Banana Island",
      "city": "Lagos",
      "state": "Lagos"
    }
  },
  "success": true
}
```

**Errors:**
- `400` — Validation error
- `401` — Not authenticated
- `403` — Role is not `user`
