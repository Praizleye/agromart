# Admin Endpoints

Base path: `/admin`

All endpoints require:
- `Authorization: Bearer <access_token>`
- Role: `admin`

Admins can invite **aggregators** and **logistics** users.

---

## POST /admin/invite

Send an invitation email to a new aggregator or logistics user. The invitee receives a link to `FRONTEND_URL/accept-invite?token=<token>` and must complete registration via `POST /auth/complete-invite`. Invitations expire after **48 hours**.

**Request body:**
```json
{
  "email": "driver@example.com",
  "role": "logistics"
}
```

| Field | Type | Required | Allowed values |
|---|---|---|---|
| email | string (email) | Yes | |
| role | string | Yes | `aggregator` \| `logistics` |

**Response 201:**
```json
{
  "message": "Invitation sent to driver@example.com.",
  "data": {
    "id": 7,
    "email": "driver@example.com",
    "role": "logistics",
    "expires_at": "2026-04-26T10:00:00.000Z"
  },
  "success": true
}
```

**Errors:**
- `400` — User with this email already exists / pending invite already sent / invalid role
- `401` — Not authenticated
- `403` — Role not allowed (e.g. trying to invite `admin`)

---

## GET /admin/aggregators

List all users with the `aggregator` role.

**Response 200:**
```json
{
  "message": "aggregator list fetched successfully.",
  "data": [
    {
      "id": 5,
      "first_name": "Bob",
      "last_name": "Jones",
      "email": "bob@example.com",
      "phone": "08011223344",
      "role": "aggregator",
      "is_active": true,
      "created_at": "2026-04-21T09:00:00.000Z"
    }
  ],
  "success": true
}
```

---

## GET /admin/logistics

List all users with the `logistics` role.

**Response 200:** Same shape as `/admin/aggregators` with `role: "logistics"`.
