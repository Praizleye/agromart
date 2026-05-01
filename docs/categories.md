# Categories Endpoints

Base path: `/categories`

---

## POST /categories/create

Create a new product category. Only admins can create categories.

**Auth required:** Yes (Admin role only)

**Request body:**
```json
{
  "category_name": "Fresh Vegetables"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| category_name | string | Yes | Unique category name |

**Response 201:**
```json
{
  "message": "Category created successfully",
  "data": {
    "id": 1,
    "name": "Fresh Vegetables",
    "slug": "fresh-vegetables",
    "description": "All fresh vegetables from our farms",
    "created_by": 5,
    "created_at": "2026-04-29T10:30:00.000Z",
    "updated_at": "2026-04-29T10:30:00.000Z",
    "deleted_at": null
  },
  "success": true
}
```

**Errors:**
- `400` — Category already exists / invalid input
- `401` — Not authenticated
- `403` — You do not have permission (not an admin)

---

## GET /categories

Retrieve all categories with pagination. No authentication required.

**Auth required:** No

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
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Fresh Vegetables",
      "slug": "fresh-vegetables",
      "description": "All fresh vegetables from our farms",
      "created_by": 5,
      "created_at": "2026-04-29T10:30:00.000Z",
      "updated_at": "2026-04-29T10:30:00.000Z",
      "deleted_at": null
    },
    {
      "id": 2,
      "name": "Grains & Cereals",
      "slug": "grains-cereals",
      "description": "High quality grains and cereals",
      "created_by": 5,
      "created_at": "2026-04-29T11:00:00.000Z",
      "updated_at": "2026-04-29T11:00:00.000Z",
      "deleted_at": null
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "last_page": 1
  },
  "success": true
}
```

**Errors:**
- `400` — Invalid pagination parameters

---

## DELETE /categories/:id

Delete a category by ID. Only admins can delete categories. Products linked to this category cannot be deleted if foreign key constraint is set to `RESTRICT`.

**Auth required:** Yes (Admin role only)

**Path params:**

| Param | Type | Notes |
|---|---|---|
| id | number | Category ID |

**Response 200:**
```json
{
  "message": "Category deleted successfully",
  "success": true
}
```

**Errors:**
- `401` — Not authenticated
- `403` — You do not have permission (not an admin)
- `404` — Category not found
- `409` — Cannot delete category. Products are still linked to it (foreign key constraint)
