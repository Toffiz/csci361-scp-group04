# Supply Chain Platform API Documentation

Base URL: `http://localhost:8080/api/v1`

## Table of Contents
- [Authentication](#authentication)
- [User Profile](#user-profile)
- [Consumer Routes](#consumer-routes)
- [Sales Routes](#sales-routes)
- [Admin Routes](#admin-routes)
- [Owner Routes](#owner-routes)
- [Platform Admin Routes](#platform-admin-routes)
- [WebSocket](#websocket)

---

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Register
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "consumer"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "role": "consumer",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
**POST** `/auth/login`

Authenticate and receive access tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "role": "consumer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Refresh Token
**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## User Profile

### Get Profile
**GET** `/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "role": "consumer",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatars/john.jpg",
  "is_active": true,
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Update Profile
**PUT** `/profile`

Update current user's profile.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Smith",
    "phone": "+1234567890"
  }
}
```

### Upload Avatar
**POST** `/profile/avatar`

Upload a profile picture.

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `avatar`
- Max file size: 5MB
- Allowed types: jpg, jpeg, png, gif

**Response:**
```json
{
  "message": "Avatar uploaded successfully",
  "avatar_url": "https://s3.amazonaws.com/bucket/avatars/user-1-avatar.jpg"
}
```

---

## Consumer Routes

**Role Required:** `consumer`

### Get Available Suppliers
**GET** `/consumer/suppliers`

List all verified and active suppliers.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by company name
- `city` (optional): Filter by city
- `country` (optional): Filter by country

**Example:**
```
GET /api/v1/consumer/suppliers?page=1&limit=10&city=Almaty&country=Kazakhstan
```

**Response:**
```json
{
  "suppliers": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "company_name": "Fresh Produce Co.",
      "address": "123 Market St",
      "city": "Almaty",
      "country": "Kazakhstan",
      "description": "Fresh fruits and vegetables supplier",
      "website": "https://freshproduce.kz",
      "is_verified": true,
      "is_active": true
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### Request Link to Supplier
**POST** `/consumer/suppliers/:id/link`

Request to connect with a supplier.

**Example:**
```
POST /api/v1/consumer/suppliers/1/link
```

**Response:**
```json
{
  "message": "Link request sent successfully",
  "link": {
    "id": 1,
    "supplier_id": 1,
    "consumer_id": 5,
    "status": "pending",
    "requested_at": "2025-11-15T10:30:00Z"
  }
}
```

### Get My Links
**GET** `/consumer/links`

Get all consumer-supplier connections.

**Query Parameters:**
- `status` (optional): Filter by status (pending, approved, denied, blocked)

**Response:**
```json
{
  "links": [
    {
      "id": 1,
      "supplier_id": 1,
      "consumer_id": 5,
      "status": "approved",
      "requested_at": "2025-11-15T10:30:00Z",
      "approved_at": "2025-11-15T11:00:00Z",
      "supplier": {
        "company_name": "Fresh Produce Co.",
        "city": "Almaty"
      }
    }
  ]
}
```

### Remove Link
**DELETE** `/consumer/links/:id`

Remove a connection with a supplier.

**Example:**
```
DELETE /api/v1/consumer/links/1
```

**Response:**
```json
{
  "message": "Link removed successfully"
}
```

### Get Products for Consumer
**GET** `/consumer/products`

Browse products from linked suppliers.

**Query Parameters:**
- `supplier_id` (optional): Filter by supplier
- `category_id` (optional): Filter by category
- `search` (optional): Search products
- `min_price` (optional): Minimum price
- `max_price` (optional): Maximum price
- `page` (optional): Page number
- `limit` (optional): Items per page

**Example:**
```
GET /api/v1/consumer/products?supplier_id=1&category_id=3&min_price=10&max_price=100
```

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "supplier_id": 1,
      "category_id": 3,
      "name": "Fresh Tomatoes",
      "description": "Organic red tomatoes",
      "sku": "TOM-001",
      "price": 25.50,
      "unit": "kg",
      "stock": 500,
      "images": "[\"https://example.com/tomatoes1.jpg\"]",
      "is_active": true,
      "supplier": {
        "company_name": "Fresh Produce Co."
      },
      "category": {
        "name": "Vegetables"
      }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

### Get Consumer Orders
**GET** `/consumer/orders`

View all orders placed by the consumer.

**Query Parameters:**
- `status` (optional): Filter by order status
- `supplier_id` (optional): Filter by supplier
- `from_date` (optional): Start date (YYYY-MM-DD)
- `to_date` (optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "orders": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "supplier_id": 1,
      "consumer_id": 5,
      "status": "confirmed",
      "total": 1500.00,
      "currency": "KZT",
      "order_date": "2025-11-15T10:30:00Z",
      "supplier": {
        "company_name": "Fresh Produce Co."
      },
      "order_items": [
        {
          "id": 1,
          "product_id": 1,
          "quantity": 10,
          "unit_price": 25.50,
          "total": 255.00,
          "product": {
            "name": "Fresh Tomatoes",
            "sku": "TOM-001"
          }
        }
      ]
    }
  ]
}
```

### Create Order
**POST** `/consumer/orders`

Place a new order with a supplier.

**Request Body:**
```json
{
  "supplier_id": 1,
  "notes": "Please deliver before 5 PM",
  "items": [
    {
      "product_id": 1,
      "quantity": 10
    },
    {
      "product_id": 2,
      "quantity": 5
    }
  ]
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "supplier_id": 1,
    "consumer_id": 5,
    "status": "pending",
    "total": 1500.00,
    "currency": "KZT",
    "order_date": "2025-11-15T10:30:00Z"
  }
}
```

### Get Consumer Chats
**GET** `/consumer/chats`

Get all chat conversations with suppliers.

**Response:**
```json
{
  "chats": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "supplier_id": 1,
      "consumer_id": 5,
      "status": "active",
      "created_at": "2025-11-15T10:30:00Z",
      "supplier": {
        "company_name": "Fresh Produce Co."
      },
      "messages": [
        {
          "id": 1,
          "content": "Hello, I have a question about product availability",
          "sender_id": 5,
          "is_read": true,
          "created_at": "2025-11-15T10:35:00Z"
        }
      ]
    }
  ]
}
```

### Create Incident
**POST** `/consumer/incidents`

Report a complaint or issue.

**Request Body:**
```json
{
  "supplier_id": 1,
  "order_id": 1,
  "chat_id": 1,
  "title": "Product quality issue",
  "description": "Received damaged tomatoes in order #123",
  "priority": "high"
}
```

**Response:**
```json
{
  "message": "Incident created successfully",
  "incident": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "consumer_id": 5,
    "supplier_id": 1,
    "order_id": 1,
    "chat_id": 1,
    "title": "Product quality issue",
    "priority": "high",
    "status": "open",
    "created_at": "2025-11-15T10:30:00Z"
  }
}
```

---

## Sales Routes

**Role Required:** `sales`

### Get Link Requests
**GET** `/sales/link-requests`

View pending connection requests from consumers.

**Query Parameters:**
- `status` (optional): Filter by status (pending, approved, denied)

**Response:**
```json
{
  "link_requests": [
    {
      "id": 1,
      "supplier_id": 1,
      "consumer_id": 5,
      "status": "pending",
      "requested_at": "2025-11-15T10:30:00Z",
      "consumer": {
        "user": {
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        }
      }
    }
  ]
}
```

### Handle Link Request
**PUT** `/sales/link-requests/:id`

Approve or deny a consumer link request.

**Request Body:**
```json
{
  "status": "approved"
}
```

**Response:**
```json
{
  "message": "Link request approved successfully",
  "link": {
    "id": 1,
    "status": "approved",
    "approved_at": "2025-11-15T11:00:00Z"
  }
}
```

### Get Linked Consumers
**GET** `/sales/consumers`

View all approved consumer connections.

**Response:**
```json
{
  "consumers": [
    {
      "id": 5,
      "user": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "preferences": "Organic products only",
      "created_at": "2025-11-15T10:30:00Z"
    }
  ]
}
```

### Get Supplier Orders
**GET** `/sales/orders`

View orders for the supplier.

**Query Parameters:**
- `status` (optional): Filter by order status
- `consumer_id` (optional): Filter by consumer
- `from_date` (optional): Start date
- `to_date` (optional): End date

**Response:**
```json
{
  "orders": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "consumer_id": 5,
      "status": "pending",
      "total": 1500.00,
      "order_date": "2025-11-15T10:30:00Z",
      "consumer": {
        "user": {
          "first_name": "John",
          "last_name": "Doe"
        }
      },
      "order_items": [...]
    }
  ]
}
```

### Update Order Status
**PUT** `/sales/orders/:id/status`

Update the status of an order.

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Order confirmed and scheduled for delivery"
}
```

**Allowed Statuses:** `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

**Response:**
```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": 1,
    "status": "confirmed",
    "updated_at": "2025-11-15T11:00:00Z"
  }
}
```

### Get Supplier Chats
**GET** `/sales/chats`

View all chat conversations with consumers.

**Response:**
```json
{
  "chats": [
    {
      "id": 1,
      "consumer_id": 5,
      "status": "active",
      "consumer": {
        "user": {
          "first_name": "John",
          "last_name": "Doe"
        }
      },
      "messages": [...]
    }
  ]
}
```

### Escalate Chat
**POST** `/sales/chats/:id/escalate`

Escalate a chat to management.

**Request Body:**
```json
{
  "reason": "Customer complaint about product quality"
}
```

**Response:**
```json
{
  "message": "Chat escalated successfully",
  "chat": {
    "id": 1,
    "status": "escalated"
  }
}
```

### Get Supplier Incidents
**GET** `/sales/incidents`

View incidents/complaints for the supplier.

**Query Parameters:**
- `status` (optional): Filter by status (open, in_progress, resolved, closed)
- `priority` (optional): Filter by priority (low, medium, high, urgent)

**Response:**
```json
{
  "incidents": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "consumer_id": 5,
      "title": "Product quality issue",
      "priority": "high",
      "status": "open",
      "created_at": "2025-11-15T10:30:00Z",
      "consumer": {
        "user": {
          "first_name": "John",
          "last_name": "Doe"
        }
      }
    }
  ]
}
```

### Update Incident
**PUT** `/sales/incidents/:id`

Update incident status or details.

**Request Body:**
```json
{
  "status": "in_progress",
  "notes": "Investigating the issue with warehouse team"
}
```

**Response:**
```json
{
  "message": "Incident updated successfully",
  "incident": {
    "id": 1,
    "status": "in_progress",
    "updated_at": "2025-11-15T11:00:00Z"
  }
}
```

---

## Admin Routes

**Role Required:** `admin` or `owner`

### Get Users
**GET** `/admin/users`

List all users in the supplier organization.

**Query Parameters:**
- `role` (optional): Filter by role
- `is_active` (optional): Filter by active status

**Response:**
```json
{
  "users": [
    {
      "id": 2,
      "email": "sales@freshproduce.kz",
      "role": "sales",
      "first_name": "Jane",
      "last_name": "Smith",
      "is_active": true,
      "created_at": "2025-11-15T10:30:00Z"
    }
  ]
}
```

### Create User
**POST** `/admin/users`

Create a new user (employee) for the supplier.

**Request Body:**
```json
{
  "email": "newsales@freshproduce.kz",
  "password": "SecurePass123!",
  "role": "sales",
  "first_name": "Mike",
  "last_name": "Johnson",
  "phone": "+7771234567"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 3,
    "email": "newsales@freshproduce.kz",
    "role": "sales",
    "first_name": "Mike",
    "last_name": "Johnson"
  }
}
```

### Update User
**PUT** `/admin/users/:id`

Update user details.

**Request Body:**
```json
{
  "first_name": "Michael",
  "last_name": "Johnson",
  "is_active": true
}
```

**Response:**
```json
{
  "message": "User updated successfully"
}
```

### Delete User
**DELETE** `/admin/users/:id`

Deactivate or delete a user.

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

### Get Products
**GET** `/admin/products`

List all products for the supplier.

**Query Parameters:**
- `category_id` (optional): Filter by category
- `is_active` (optional): Filter by active status
- `search` (optional): Search by name or SKU

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Fresh Tomatoes",
      "sku": "TOM-001",
      "price": 25.50,
      "stock": 500,
      "category": {
        "name": "Vegetables"
      }
    }
  ]
}
```

### Create Product
**POST** `/admin/products`

Add a new product to the catalog.

**Request Body:**
```json
{
  "category_id": 3,
  "name": "Fresh Tomatoes",
  "description": "Organic red tomatoes",
  "sku": "TOM-001",
  "price": 25.50,
  "unit": "kg",
  "stock": 500,
  "min_stock": 50,
  "is_active": true
}
```

**Response:**
```json
{
  "message": "Product created successfully",
  "product": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Fresh Tomatoes",
    "sku": "TOM-001"
  }
}
```

### Update Product
**PUT** `/admin/products/:id`

Update product details.

**Request Body:**
```json
{
  "price": 27.00,
  "stock": 450,
  "is_active": true
}
```

**Response:**
```json
{
  "message": "Product updated successfully"
}
```

### Delete Product
**DELETE** `/admin/products/:id`

Remove a product from the catalog.

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

### Upload Product Images
**POST** `/admin/products/:id/images`

Upload images for a product.

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `images` (supports multiple files)
- Max files: 5
- Allowed types: jpg, jpeg, png

**Response:**
```json
{
  "message": "Images uploaded successfully",
  "image_urls": [
    "https://s3.amazonaws.com/bucket/products/product-1-img1.jpg",
    "https://s3.amazonaws.com/bucket/products/product-1-img2.jpg"
  ]
}
```

### Create Category
**POST** `/admin/categories`

Create a new product category.

**Request Body:**
```json
{
  "name": "Vegetables",
  "description": "Fresh vegetables and greens",
  "parent_id": null,
  "is_active": true
}
```

**Response:**
```json
{
  "message": "Category created successfully",
  "category": {
    "id": 3,
    "name": "Vegetables"
  }
}
```

### Update Category
**PUT** `/admin/categories/:id`

Update category details.

**Response:**
```json
{
  "message": "Category updated successfully"
}
```

### Delete Category
**DELETE** `/admin/categories/:id`

Delete a category.

**Response:**
```json
{
  "message": "Category deleted successfully"
}
```

### Get All Orders
**GET** `/admin/orders`

View all orders for the supplier (admin view).

**Response:**
```json
{
  "orders": [...],
  "total": 150,
  "total_revenue": 450000.00
}
```

### Get Analytics Dashboard
**GET** `/admin/analytics`

Get overview analytics and KPIs.

**Query Parameters:**
- `from_date` (optional): Start date
- `to_date` (optional): End date
- `period` (optional): daily, weekly, monthly

**Response:**
```json
{
  "dashboard": {
    "total_orders": 150,
    "total_revenue": 450000.00,
    "avg_order_value": 3000.00,
    "active_consumers": 45,
    "pending_incidents": 3,
    "chart_data": {
      "dates": ["2025-11-01", "2025-11-02", "..."],
      "revenue": [15000, 18000, "..."],
      "orders": [5, 6, "..."]
    }
  }
}
```

### Get KPIs
**GET** `/admin/analytics/kpis`

Get key performance indicators.

**Response:**
```json
{
  "kpis": {
    "gmv": 1500000.00,
    "order_count": 500,
    "avg_order_value": 3000.00,
    "consumer_count": 120,
    "incident_resolution_rate": 0.95,
    "avg_resolution_time_hours": 24
  }
}
```

### Get All Incidents
**GET** `/admin/incidents`

View all incidents (admin view).

**Response:**
```json
{
  "incidents": [...],
  "total": 25,
  "open": 3,
  "in_progress": 5,
  "resolved": 17
}
```

### Assign Incident
**PUT** `/admin/incidents/:id/assign`

Assign an incident to a team member.

**Request Body:**
```json
{
  "assigned_to": 2
}
```

**Response:**
```json
{
  "message": "Incident assigned successfully"
}
```

### Resolve Incident
**PUT** `/admin/incidents/:id/resolve`

Mark an incident as resolved.

**Request Body:**
```json
{
  "resolution_notes": "Issue resolved by replacing damaged products"
}
```

**Response:**
```json
{
  "message": "Incident resolved successfully",
  "incident": {
    "id": 1,
    "status": "resolved",
    "resolved_at": "2025-11-15T14:30:00Z"
  }
}
```

### Get Subscription
**GET** `/admin/subscription`

View current subscription details.

**Response:**
```json
{
  "subscription": {
    "id": 1,
    "plan_name": "Professional",
    "status": "active",
    "start_date": "2025-01-01T00:00:00Z",
    "end_date": "2026-01-01T00:00:00Z",
    "price": 50000.00,
    "currency": "KZT",
    "billing_cycle": "monthly",
    "features": "[\"Unlimited products\", \"Advanced analytics\", \"Priority support\"]"
  }
}
```

### Update Subscription
**PUT** `/admin/subscription`

Upgrade or modify subscription plan.

**Request Body:**
```json
{
  "plan_name": "Enterprise",
  "billing_cycle": "yearly"
}
```

**Response:**
```json
{
  "message": "Subscription updated successfully"
}
```

---

## Owner Routes

**Role Required:** `owner`

### Get Complaints Report
**GET** `/owner/reports/complaints`

Generate a comprehensive complaints/incidents report.

**Query Parameters:**
- `from_date`: Start date (required)
- `to_date`: End date (required)
- `format` (optional): json, csv, pdf

**Example:**
```
GET /api/v1/owner/reports/complaints?from_date=2025-11-01&to_date=2025-11-15&format=json
```

**Response:**
```json
{
  "report": {
    "period": "2025-11-01 to 2025-11-15",
    "total_incidents": 25,
    "by_priority": {
      "urgent": 2,
      "high": 8,
      "medium": 10,
      "low": 5
    },
    "by_status": {
      "open": 3,
      "in_progress": 5,
      "resolved": 15,
      "closed": 2
    },
    "avg_resolution_time_hours": 24,
    "incidents": [...]
  }
}
```

### Export Chat Transcripts
**GET** `/owner/reports/transcripts`

Export chat transcripts for analysis.

**Query Parameters:**
- `from_date`: Start date (required)
- `to_date`: End date (required)
- `consumer_id` (optional): Filter by consumer
- `format` (optional): json, csv

**Response:**
```json
{
  "transcripts": [
    {
      "chat_id": 1,
      "consumer": "John Doe",
      "started_at": "2025-11-15T10:00:00Z",
      "messages": [
        {
          "sender": "John Doe",
          "content": "Hello, I have a question",
          "timestamp": "2025-11-15T10:00:15Z"
        },
        {
          "sender": "Sales Rep",
          "content": "How can I help you?",
          "timestamp": "2025-11-15T10:01:00Z"
        }
      ]
    }
  ]
}
```

### Export Incidents Report
**GET** `/owner/reports/incidents`

Export detailed incidents report.

**Query Parameters:**
- `from_date`: Start date (required)
- `to_date`: End date (required)
- `format` (optional): json, csv, pdf

**Response:**
```json
{
  "report_url": "https://s3.amazonaws.com/bucket/reports/incidents-2025-11-15.pdf"
}
```

---

## Platform Admin Routes

**Role Required:** `platform_admin`

### Get All Suppliers
**GET** `/platform/suppliers`

View all suppliers on the platform.

**Query Parameters:**
- `is_verified` (optional): Filter by verification status
- `is_active` (optional): Filter by active status

**Response:**
```json
{
  "suppliers": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "company_name": "Fresh Produce Co.",
      "is_verified": true,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Verify Supplier
**PUT** `/platform/suppliers/:id/verify`

Verify a supplier's business license and credentials.

**Request Body:**
```json
{
  "is_verified": true,
  "verification_notes": "All documents verified successfully"
}
```

**Response:**
```json
{
  "message": "Supplier verified successfully"
}
```

### Suspend Supplier
**PUT** `/platform/suppliers/:id/suspend`

Suspend or reactivate a supplier.

**Request Body:**
```json
{
  "is_active": false,
  "reason": "Policy violation"
}
```

**Response:**
```json
{
  "message": "Supplier suspended successfully"
}
```

### Get All Subscriptions
**GET** `/platform/subscriptions`

View all supplier subscriptions.

**Response:**
```json
{
  "subscriptions": [
    {
      "id": 1,
      "supplier_id": 1,
      "plan_name": "Professional",
      "status": "active",
      "price": 50000.00,
      "supplier": {
        "company_name": "Fresh Produce Co."
      }
    }
  ]
}
```

### Get Platform Analytics
**GET** `/platform/analytics/platform`

Get platform-wide analytics and metrics.

**Query Parameters:**
- `from_date`: Start date
- `to_date`: End date

**Response:**
```json
{
  "analytics": {
    "total_suppliers": 150,
    "active_suppliers": 142,
    "total_consumers": 5000,
    "total_orders": 25000,
    "platform_gmv": 75000000.00,
    "avg_order_value": 3000.00,
    "revenue_by_plan": {
      "basic": 1000000.00,
      "professional": 3500000.00,
      "enterprise": 5500000.00
    }
  }
}
```

---

## WebSocket

**Endpoint:** `ws://localhost:8080/api/v1/ws`

Real-time bidirectional communication for chat messages, notifications, and order updates.

**Authentication:**
Include JWT token as a query parameter:
```
ws://localhost:8080/api/v1/ws?token=<your-jwt-token>
```

### Message Types

#### Send Chat Message
```json
{
  "type": "chat_message",
  "chat_id": 1,
  "content": "Hello, is this product available?",
  "message_type": "text"
}
```

#### Receive Chat Message
```json
{
  "type": "chat_message",
  "data": {
    "id": 123,
    "chat_id": 1,
    "sender_id": 5,
    "content": "Yes, we have it in stock",
    "created_at": "2025-11-15T10:30:00Z"
  }
}
```

#### Order Update Notification
```json
{
  "type": "order_update",
  "data": {
    "order_id": 1,
    "status": "confirmed",
    "message": "Your order has been confirmed"
  }
}
```

#### Incident Update
```json
{
  "type": "incident_update",
  "data": {
    "incident_id": 1,
    "status": "resolved",
    "message": "Your incident has been resolved"
  }
}
```

#### Typing Indicator
```json
{
  "type": "typing",
  "chat_id": 1,
  "user_id": 5,
  "is_typing": true
}
```

---

## Public Routes

### Get Categories
**GET** `/categories`

Get all product categories (no authentication required).

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Fruits",
      "description": "Fresh fruits",
      "parent_id": null,
      "children": [
        {
          "id": 2,
          "name": "Citrus",
          "parent_id": 1
        }
      ]
    }
  ]
}
```

---

## Error Responses

All endpoints may return these standard error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request parameters",
  "details": "email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Public endpoints:** 100 requests per minute per IP
- **Authenticated endpoints:** 1000 requests per minute per user
- **Upload endpoints:** 10 requests per minute per user

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1636972800
```

---

## Pagination

List endpoints support pagination with these query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

---

## Testing Examples

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'
```

**Get Profile:**
```bash
curl -X GET http://localhost:8080/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create Order:**
```bash
curl -X POST http://localhost:8080/api/v1/consumer/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": 1,
    "items": [
      {"product_id": 1, "quantity": 10},
      {"product_id": 2, "quantity": 5}
    ]
  }'
```

### Using JavaScript (Fetch API)

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'john@example.com',
      password: 'SecurePass123!'
    })
  });
  const data = await response.json();
  return data.token;
};

// Get Products
const getProducts = async (token) => {
  const response = await fetch('http://localhost:8080/api/v1/consumer/products', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

---

## Development Notes

- Base URL for local development: `http://localhost:8080/api/v1`
- Health check endpoint: `http://localhost:8080/health`
- All timestamps are in ISO 8601 format (UTC)
- Currency amounts are in the smallest unit (e.g., KZT doesn't use decimals)
- File uploads use multipart/form-data encoding
- WebSocket connections require valid JWT authentication
