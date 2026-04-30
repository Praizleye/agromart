# Products Endpoints

Base path: `/products`

---

## POST /products/create

Create a new product. Only admins can create products.

**Auth required:** Yes (Admin role only)

**Request body:**
```json
{
  "name": "Organic Tomatoes",
  "description": "Freshly picked organic tomatoes from our best farm.",
  "sku": "TOM-ORG-001",
  "farm_id": 1,
  "category_id": 2,
  "price": "150.50",
  "quantity_in_stock": 100,
  "unit": "kg",
  "minimum_order_quantity": 5,
  "is_available": true,
  "file_ids": [1, 2, 3]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | Yes | Min 1 character |
| description | string | Yes | Min 10 characters |
| sku | string | No | |
| farm_id | number (int) | Yes | Positive integer |
| category_id | number (int) | Yes | Positive integer |
| price | string | Yes | Valid decimal format |
| quantity_in_stock | number (int) | No | Min 0 (default: 0) |
| unit | string | No | Min 1 character (default: "kg") |
| minimum_order_quantity | number (int) | No | Positive integer (default: 1) |
| is_available | boolean | No | (default: true) |
| file_ids | array of numbers | No | Max 5 images |

**Response 201:**
```json
{
  "message": "Product created successfully.",
  "data": {
    "id": 1,
    "name": "Organic Tomatoes",
    "description": "Freshly picked organic tomatoes from our best farm.",
    "sku": "TOM-ORG-001",
    "farm_id": 1,
    "category_id": 2,
    "price": "150.50",
    "quantity_in_stock": 100,
    "unit": "kg",
    "minimum_order_quantity": 5,
    "is_available": true,
    "created_at": "2026-04-30T10:30:00.000Z",
    "updated_at": "2026-04-30T10:30:00.000Z"
  },
  "success": true
}
```

**Errors:**
- `400` — Invalid input
- `401` — Not authenticated
- `403` — You do not have permission (not an admin)

---

## GET /products

Retrieve all products with pagination and filtering. No authentication required.

**Auth required:** No

**Query params:**

| Param | Type | Required | Notes |
|---|---|---|---|
| limit | number | No | Items per page (default: 10) |
| offset | number | No | Number of items to skip (default: 0) |
| category_id | number | No | Filter by Category ID |
| farm_id | number | No | Filter by Farm ID |
| is_available | boolean | No | Filter by availability |
| unit | string | No | Filter by unit type |
| min_price | number | No | Minimum price |
| max_price | number | No | Maximum price |
| in_stock | boolean | No | Filter items in stock |
| search | string | No | Search by name |
| sort_by | string | No | Sort field: 'price', 'created_at', 'name', 'quantity_in_stock' (default: 'created_at') |
| sort_order | string | No | 'asc' or 'desc' (default: 'desc') |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Organic Tomatoes",
      "description": "Freshly picked organic tomatoes from our best farm.",
      "sku": "TOM-ORG-001",
      "farm_id": 1,
      "category_id": 2,
      "price": "150.50",
      "quantity_in_stock": 100,
      "unit": "kg",
      "minimum_order_quantity": 5,
      "is_available": true
    }
  ],
  "meta": {
    "total": 1,
    "limit": 10,
    "offset": 0
  },
  "success": true
}
```

**Errors:**
- `400` — Invalid query parameters (e.g. min_price > max_price)

---

## GET /products/:id

Retrieve a single product by ID.

**Auth required:** No

**Path params:**

| Param | Type | Notes |
|---|---|---|
| id | number | Product ID |

**Response 200:**
```json
{
  "data": {
    "id": 1,
    "name": "Organic Tomatoes",
    "description": "Freshly picked organic tomatoes from our best farm.",
    "sku": "TOM-ORG-001",
    "farm_id": 1,
    "category_id": 2,
    "price": "150.50",
    "quantity_in_stock": 100,
    "unit": "kg",
    "minimum_order_quantity": 5,
    "is_available": true,
    "created_at": "2026-04-30T10:30:00.000Z",
    "updated_at": "2026-04-30T10:30:00.000Z"
  },
  "success": true
}
```

**Errors:**
- `404` — Product not found

---

## PATCH /products/:id

Update a product by ID. Only admins can update products.

**Auth required:** Yes (Admin role only)

**Path params:**

| Param | Type | Notes |
|---|---|---|
| id | number | Product ID |

**Request body:**
```json
{
  "price": "145.00",
  "quantity_in_stock": 150
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | No | Min 1 character |
| description | string | No | Min 10 characters |
| sku | string | No | |
| farm_id | number (int) | No | Positive integer |
| category_id | number (int) | No | Positive integer |
| price | string | No | Valid decimal format |
| quantity_in_stock | number (int) | No | Min 0 |
| unit | string | No | Min 1 character |
| minimum_order_quantity | number (int) | No | Positive integer |
| is_available | boolean | No | |
| file_ids | array of numbers | No | Max 5 images |

**Response 200:**
```json
{
  "message": "Product updated successfully.",
  "data": {
    "id": 1,
    "name": "Organic Tomatoes",
    "description": "Freshly picked organic tomatoes from our best farm.",
    "sku": "TOM-ORG-001",
    "farm_id": 1,
    "category_id": 2,
    "price": "145.00",
    "quantity_in_stock": 150,
    "unit": "kg",
    "minimum_order_quantity": 5,
    "is_available": true,
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
- `404` — Product not found

---

## DELETE /products/:id

Delete a product by ID. Only admins can delete products.

**Auth required:** Yes (Admin role only)

**Path params:**

| Param | Type | Notes |
|---|---|---|
| id | number | Product ID |

**Response 200:**
```json
{
  "message": "Product deleted successfully.",
  "success": true
}
```

**Errors:**
- `401` — Not authenticated
- `403` — You do not have permission (not an admin)
- `404` — Product not found
