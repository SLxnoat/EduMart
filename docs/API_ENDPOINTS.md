# EduMart API Endpoints

This document outlines the RESTful API endpoints for the EduMart e-commerce platform.

## Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user and get JWT token | Public |
| POST | `/api/auth/logout` | Logout user (clear client-side token) | Private |
| POST | `/api/auth/refresh` | Refresh JWT token | Private |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password` | Reset password with token | Public |

## Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users/profile` | Get current user profile | Private |
| PUT | `/api/users/profile` | Update current user profile | Private |
| GET | `/api/users/:id` | Get user by ID | Private (Admin/Self) |

## Products

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | Get all products (with filtering/pagination) | Public |
| GET | `/api/products/:id` | Get product by ID | Public |
| POST | `/api/products` | Create new product | Private (Seller/Admin) |
| PUT | `/api/products/:id` | Update product | Private (Owner/Admin) |
| DELETE | `/api/products/:id` | Delete product | Private (Owner/Admin) |
| GET | `/api/products/:id/preview` | Get product preview (digital) | Public |

## Cart

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/cart` | Get user's cart | Private |
| POST | `/api/cart/items` | Add item to cart | Private |
| PUT | `/api/cart/items/:id` | Update cart item quantity | Private |
| DELETE | `/api/cart/items/:id` | Remove item from cart | Private |
| DELETE | `/api/cart` | Clear cart | Private |

## Orders

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/orders` | Get user's orders | Private |
| GET | `/api/orders/:id` | Get order by ID | Private |
| POST | `/api/orders` | Create order from cart | Private |
| PUT | `/api/orders/:id/status` | Update order status | Private (Admin) |
| POST | `/api/orders/:id/cancel` | Cancel order | Private |

## Payments

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/payments/create` | Create payment intent | Private |
| POST | `/api/payments/webhook` | Payment webhook handler (Stripe) | Public (Stripe) |
| GET | `/api/payments/status/:id` | Check payment status | Private |

## Reviews

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/reviews/product/:id` | Get reviews for product | Public |
| POST | `/api/reviews` | Create review | Private |
| PUT | `/api/reviews/:id` | Update review | Private (Owner) |
| DELETE | `/api/reviews/:id` | Delete review | Private (Owner/Admin) |

## Admin

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/admin/stats` | Get dashboard statistics | Private (Admin) |
| GET | `/admin/users` | Get all users (paginated) | Private (Admin) |
| PUT | `/admin/users/:id/status` | Update user status | Private (Admin) |
| GET | `/admin/products/pending` | Get pending product approvals | Private (Admin) |
| PUT | `/admin/products/:id/approve` | Approve/reject product | Private (Admin) |
| GET | `/admin/reviews/pending` | Get pending reviews | Private (Admin) |
| PUT | `/admin/reviews/:id/approve` | Approve/reject review | Private (Admin) |
| GET | `/admin/orders` | Get all orders (filtered) | Private (Admin) |

## Notifications

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/notifications` | Get user's notifications | Private |
| PUT | `/notifications/:id/read` | Mark notification as read | Private |
| DELETE | `/notifications/:id` | Delete notification | Private |

## Coupons & Promotions

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/coupons` | List coupons (with validation) | Public |
| GET | `/api/coupons/:code` | Get coupon by code | Public |
| POST | `/api/coupons` | Create coupon | Private (Admin/Seller) |
| PUT | `/api/coupons/:id` | Update coupon | Private (Admin/Seller) |
| DELETE | `/api/coupons/:id` | Delete coupon | Private (Admin/Seller) |
| POST | `/api/coupons/validate` | Validate coupon code | Private |
| POST | `/api/coupons/:code/use` | Mark coupon as used | Private |

## Digital Delivery

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/digital-delivery/:product_id` | Get digital download link | Private |
| POST | `/api/digital-delivery/:product_id/download` | Record download | Private |

## Physical Shipments

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/shipments/:order_id` | Get shipment tracking | Private |
| PUT | `/api/shipments/:id/status` | Update shipment status | Private (Admin) |

## AI Chatbot

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/chatbot/message` | Send message to chatbot | Private |
| GET | `/api/chatbot/history` | Get chat history | Private |
| POST | `/api/chatbot/feedback` | Provide feedback on response | Private |

## Seller Earnings & Payouts

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/seller/earnings` | Get seller earnings | Private (Seller) |
| GET | `/api/seller/earnings/:id` | Get specific earning record | Private (Seller) |
| POST | `/api/seller/payout/request` | Request payout | Private (Seller) |
| PUT | `/api/seller/payout/:id/process` | Process payout (admin) | Private (Admin) |

## Error Responses

All API endpoints follow a consistent error response format:

```json
{
  "message": "Error description",
  "error": "Optional error details",
  "statusCode": 400
}
```

## Success Responses

Successful responses vary by endpoint but generally follow these patterns:

### Single Resource
```json
{
  "data": {
    // Resource data
  }
}
```

### Collection of Resources
```json
{
  "data": [
    // Array of resources
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens can be obtained by logging in via the `/api/auth/login` endpoint.

## Rate Limiting

API endpoints are subject to rate limiting to prevent abuse:
- Auth endpoints: 5 requests per minute per IP
- All other endpoints: 100 requests per minute per IP

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time until reset (epoch seconds)

## Versioning

The API is versioned using the `/api/v1/` prefix. Future versions will be available under `/api/v2/` etc., while maintaining backward compatibility where possible.