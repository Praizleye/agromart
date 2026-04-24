# Super Admin Endpoints

Base path: `/super-admin`

All endpoints require:
- `Authorization: Bearer <access_token>`
- Role: `super_admin`

Super admins can invite **admins** and **aggregators**.

---

## POST /super-admin/invite

Send an invitation email to a new admin or aggregator. The invitee receives a link to `FRONTEND_URL/accept-invite?token=<token>` and must complete registration via `POST /auth/complete-invite`. Invitations expire after **48 hours**.

**Request body:**
```json
{
  "email": "newadmin@example.com",
  "role": "admin"
}
```

| Field | Type | Required | Allowed values |
|---|---|---|---|
| email | string (email) | Yes | |
| role | string | Yes | `admin` \| `aggregator` |

**Response 201:**
```json
{
  "message": "Invitation sent to newadmin@example.com.",
  "data": {
    "id": 3,
    "email": "newadmin@example.com",
    "role": "admin",
    "expires_at": "2026-04-26T10:00:00.000Z"
  },
  "success": true
}
```

**Errors:**
- `400` — User with this email already exists / pending invite already sent / invalid role
- `401` — Not authenticated
- `403` — Role not allowed (e.g. trying to invite `logistics`)

---

## GET /super-admin/admins

List all users with the `admin` role.

**Response 200:**
```json
{
  "message": "admin list fetched successfully.",
  "data": [
    {
      "id": 2,
      "first_name": "Alice",
      "last_name": "Smith",
      "email": "alice@example.com",
      "phone": null,
      "role": "admin",
      "is_active": true,
      "is_email_verified": true,
      "created_at": "2026-04-20T08:00:00.000Z"
    }
  ],
  "success": true
}
```

---

## GET /super-admin/aggregators

List all users with the `aggregator` role.

**Response 200:** Same shape as `/super-admin/admins` with `role: "aggregator"`.

---

## GET /super-admin/logistics

List all users with the `logistics` role.

**Response 200:** Same shape as `/super-admin/admins` with `role: "logistics"`.

---

## GET /super-admin/users

List all users with the `user` role.

**Response 200:** Same shape as `/super-admin/admins` with `role: "user"`.
