# Farms Endpoints

Base path: `/farms`

---

## POST /farms/create

Create a new farm. Only admins can create farms.

**Auth required:** Yes (Admin role only)

**Request body:**
```json
{
  "name": "Green Valley Farm",
  "description": "A beautiful organic farm.",
  "address": "123 Green Valley Rd",
  "phone": "08012345678",
  "email": "contact@greenvalley.com"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | Yes | |
| description | string | No | |
| address | string | Yes | |
| phone | string | Yes | Max 20 chars |
| email | string (email) | No | |

**Response 201:**
```json
{
  "message": "Farm created successfully.",
  "data": {
    "id": 1,
    "name": "Green Valley Farm",
    "description": "A beautiful organic farm.",
    "address": "123 Green Valley Rd",
    "phone": "08012345678",
    "email": "contact@greenvalley.com",
    "created_at": "2026-04-30T10:30:00.000Z",
    "updated_at": "2026-04-30T10:30:00.000Z"
  },
  "success": true
}
```

**Errors:**
- `400` — Possible duplicate data / invalid input
- `401` — Not authenticated
- `403` — You do not have permission (not an admin)

---

## GET /farms

Retrieve all farms with pagination.

**Auth required:** Yes (Admin role only)

**Request body:**
```json
{
  "page": 1,
  "limit": 10,
  "sort_order": "desc"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| sort_order | string | No | "asc" or "desc" (default: "asc") |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Green Valley Farm",
      "description": "A beautiful organic farm.",
      "address": "123 Green Valley Rd",
      "phone": "08012345678",
      "email": "contact@greenvalley.com"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "last_page": 1
  },
  "success": true
}
```

**Errors:**
- `400` — Invalid pagination parameters
- `401` — Not authenticated
- `403` — You do not have permission (not an admin)

---

## GET /farms/:id

Retrieve a single farm by ID.

**Auth required:** Yes (Admin role only)

**Path params:**

| Param | Type | Notes |
|---|---|---|
| id | number | Farm ID |

**Response 200:**
```json
{
  "data": {
    "id": 1,
    "name": "Green Valley Farm",
    "description": "A beautiful organic farm.",
    "address": "123 Green Valley Rd",
    "phone": "08012345678",
    "email": "contact@greenvalley.com",
    "created_at": "2026-04-30T10:30:00.000Z",
    "updated_at": "2026-04-30T10:30:00.000Z"
  },
  "success": true
}
```

**Errors:**
- `401` — Not authenticated
- `403` — You do not have permission (not an admin)
- `404` — Farm not found

---

## PATCH /farms/:id

Update a farm by ID. Only admins can update farms.

**Auth required:** Yes (Admin role only)

**Path params:**

| Param | Type | Notes |
|---|---|---|
| id | number | Farm ID |

**Request body:**
```json
{
  "name": "Updated Green Valley Farm",
  "phone": "08098765432"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | No | |
| description | string | No | |
| address | string | No | |
| phone | string | No | Max 20 chars |
| email | string (email) | No | |

**Response 200:**
```json
{
  "message": "Farm updated successfully.",
  "data": {
    "id": 1,
    "name": "Updated Green Valley Farm",
    "description": "A beautiful organic farm.",
    "address": "123 Green Valley Rd",
    "phone": "08098765432",
    "email": "contact@greenvalley.com",
    "created_at": "2026-04-30T10:30:00.000Z",
    "updated_at": "2026-04-30T11:00:00.000Z"
  },
  "success": true
}
```

**Errors:**
- `400` — Invalid input
- `401` — Not authenticated
- `403` — You do not have permission (not an admin)
- `404` — Farm not found

---

## DELETE /farms/:id

Delete a farm by ID. Only admins can delete farms.

**Auth required:** Yes (Admin role only)

**Path params:**

| Param | Type | Notes |
|---|---|---|
| id | number | Farm ID |

**Response 200:**
```json
{
  "message": "Farm removed successfully.",
  "data": {
    "id": 1,
    "name": "Green Valley Farm",
    "description": "A beautiful organic farm.",
    "address": "123 Green Valley Rd",
    "phone": "08012345678",
    "email": "contact@greenvalley.com",
    "created_at": "2026-04-30T10:30:00.000Z",
    "updated_at": "2026-04-30T10:30:00.000Z"
  },
  "success": true
}
```

**Errors:**
- `401` — Not authenticated
- `403` — You do not have permission (not an admin)
- `404` — Farm not found
