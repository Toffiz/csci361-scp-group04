# Supply Chain Platform - Backend API

Go-based REST API backend for the Consumer-Supplier Communication Platform.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Consumer, Sales, Admin, Owner)
- **Supplier Management**: Registration, verification, subscription management
- **Product Catalog**: Categories, inventory management, pricing
- **Order Management**: Order creation, tracking, status updates
- **Real-time Chat**: WebSocket-based chat with file attachments, typing indicators, read receipts
- **Incident Management**: Complaint logging, escalation workflow, resolution tracking
- **Analytics & Reporting**: KPIs, sales metrics, dashboard analytics
- **Multi-language Support**: Prepared for KZ market localization

## Tech Stack

- **Go 1.23+**
- **Gin Web Framework**
- **GORM** (PostgreSQL ORM)
- **JWT** for authentication
- **WebSocket** for real-time features
- **PostgreSQL** database
- **Docker** for containerization

## Project Structure

```
backend/
├── main.go              # Application entry point
├── config/              # Configuration management
├── database/            # Database connection and migrations
├── models/              # Data models (User, Product, Order, etc.)
├── handlers/            # HTTP request handlers
│   ├── auth.go         # Authentication endpoints
│   ├── user.go         # User management
│   ├── supplier.go     # Supplier operations
│   ├── consumer.go     # Consumer operations
│   ├── product.go      # Product catalog
│   ├── order.go        # Order management
│   ├── chat.go         # Chat operations
│   ├── incident.go     # Incident management
│   └── analytics.go    # Analytics & reporting
├── middleware/          # HTTP middleware (auth, logging, etc.)
├── routes/              # API route definitions
├── websocket/           # WebSocket hub for real-time features
├── Dockerfile          # Docker configuration
└── .env.example        # Environment variables template
```

## Getting Started

### Prerequisites

- Go 1.23 or higher
- PostgreSQL 14+
- Docker (optional)

### Installation

1. **Clone the repository**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   go mod download
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up PostgreSQL database**

   ```bash
   createdb scp_platform
   ```

5. **Run the application**
   ```bash
   go run main.go
   ```

The server will start on `http://localhost:5000`

### Using Docker

1. **Build and run with Docker Compose** (from project root)

   ```bash
   docker-compose up --build
   ```

2. **Or build backend only**
   ```bash
   docker build -t scp-backend .
   docker run -p 5000:5000 --env-file .env scp-backend
   ```

## API Documentation

### Authentication

#### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "consumer",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+7 777 123 4567"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
	"token": "eyJhbGciOiJIUzI1NiIs...",
	"refresh_token": "eyJhbGciOiJIUzI1NiIs...",
	"user": {
		"id": 1,
		"email": "user@example.com",
		"role": "consumer",
		"first_name": "John",
		"last_name": "Doe"
	},
	"expires_in": 3600
}
```

### Consumer Endpoints

All consumer endpoints require authentication with role `consumer`.

```http
GET    /api/v1/consumer/suppliers           # Get available suppliers
POST   /api/v1/consumer/suppliers/:id/link  # Request link to supplier
GET    /api/v1/consumer/links               # Get my supplier links
DELETE /api/v1/consumer/links/:id           # Remove supplier link
GET    /api/v1/consumer/products            # Get products from linked suppliers
GET    /api/v1/consumer/orders              # Get my orders
POST   /api/v1/consumer/orders              # Create new order
GET    /api/v1/consumer/chats               # Get my chats
POST   /api/v1/consumer/incidents           # Create incident/complaint
```

### Sales Endpoints

Sales endpoints require authentication with role `sales`.

```http
GET    /api/v1/sales/link-requests          # Get pending link requests
PUT    /api/v1/sales/link-requests/:id      # Approve/deny link request
GET    /api/v1/sales/consumers              # Get linked consumers
GET    /api/v1/sales/orders                 # Get supplier orders
PUT    /api/v1/sales/orders/:id/status      # Update order status
GET    /api/v1/sales/chats                  # Get supplier chats
POST   /api/v1/sales/chats/:id/escalate     # Escalate chat to admin
GET    /api/v1/sales/incidents              # Get supplier incidents
PUT    /api/v1/sales/incidents/:id          # Update incident
```

### Admin Endpoints

Admin endpoints require authentication with role `admin` or `owner`.

```http
GET    /api/v1/admin/users                  # Get all users
POST   /api/v1/admin/users                  # Create user
PUT    /api/v1/admin/users/:id              # Update user
DELETE /api/v1/admin/users/:id              # Delete user

GET    /api/v1/admin/products               # Get products
POST   /api/v1/admin/products               # Create product
PUT    /api/v1/admin/products/:id           # Update product
DELETE /api/v1/admin/products/:id           # Delete product
POST   /api/v1/admin/products/:id/images    # Upload product images

POST   /api/v1/admin/categories             # Create category
PUT    /api/v1/admin/categories/:id         # Update category
DELETE /api/v1/admin/categories/:id         # Delete category

GET    /api/v1/admin/orders                 # Get all orders
GET    /api/v1/admin/analytics              # Get dashboard analytics
GET    /api/v1/admin/analytics/kpis         # Get detailed KPIs

GET    /api/v1/admin/incidents              # Get all incidents
PUT    /api/v1/admin/incidents/:id/assign   # Assign incident
PUT    /api/v1/admin/incidents/:id/resolve  # Resolve incident

GET    /api/v1/admin/subscription           # Get subscription details
PUT    /api/v1/admin/subscription           # Update subscription
```

### Owner Endpoints

Owner endpoints require authentication with role `owner`.

```http
GET    /api/v1/owner/reports/complaints     # Get complaints report
GET    /api/v1/owner/reports/transcripts    # Export chat transcripts
GET    /api/v1/owner/reports/incidents      # Export incidents
```

### WebSocket

Connect to WebSocket for real-time chat:

```javascript
const ws = new WebSocket('ws://localhost:5000/api/v1/ws?token=YOUR_JWT_TOKEN')

ws.onopen = () => {
	console.log('Connected to chat')
}

ws.onmessage = event => {
	const message = JSON.parse(event.data)
	console.log('New message:', message)
}

// Send message
ws.send(
	JSON.stringify({
		type: 'message',
		chat_id: 1,
		content: 'Hello!',
	})
)
```

## Database Models

### Key Models

- **User**: Base user account (all roles)
- **Supplier**: Supplier company/organization
- **Consumer**: Consumer profile
- **ConsumerSupplierLink**: Approved connections between consumers and suppliers
- **Product**: Product/inventory items
- **Category**: Product categories
- **Order**: Customer orders
- **OrderItem**: Individual items in orders
- **Chat**: Chat conversations
- **Message**: Chat messages with attachments
- **Incident**: Complaints/issues with escalation
- **Subscription**: Supplier subscription plans
- **Analytics**: KPI and metrics data

## Environment Variables

| Variable                | Description                          | Default                                                |
| ----------------------- | ------------------------------------ | ------------------------------------------------------ |
| `PORT`                  | Server port                          | `5000`                                                 |
| `ENVIRONMENT`           | Environment (development/production) | `development`                                          |
| `DATABASE_URL`          | PostgreSQL connection string         | `postgres://user:password@localhost:5432/scp_platform` |
| `JWT_SECRET`            | Secret key for JWT tokens            | -                                                      |
| `AWS_ACCESS_KEY_ID`     | AWS access key for S3 uploads        | -                                                      |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key                       | -                                                      |
| `AWS_REGION`            | AWS region                           | `us-east-1`                                            |
| `S3_BUCKET`             | S3 bucket for file uploads           | `scp-platform-uploads`                                 |
| `FRONTEND_URL`          | Frontend URL for CORS                | `http://localhost:3000`                                |

## Development

### Running Tests

```bash
go test ./...
```

### Code Formatting

```bash
go fmt ./...
```

### Linting

```bash
golangci-lint run
```

## Deployment

### Production Checklist

- [ ] Update `JWT_SECRET` to a secure random string
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure production database URL
- [ ] Set up AWS credentials for file uploads
- [ ] Configure CORS for production frontend URL
- [ ] Enable HTTPS/TLS
- [ ] Set up monitoring and logging
- [ ] Configure database backups
- [ ] Review and update security headers

### Deploy to Production

1. Build the application:

   ```bash
   go build -o main .
   ```

2. Run with production environment:
   ```bash
   ENVIRONMENT=production ./main
   ```

Or use Docker:

```bash
docker build -t scp-backend:production .
docker run -d -p 5000:5000 --env-file .env.production scp-backend:production
```

## MVP Features (November 20, 2025 Target)

✅ **Completed:**

- User authentication (Consumer, Sales, Admin, Owner roles)
- Supplier-Consumer link management
- Product catalog and inventory
- Order management
- Real-time chat with WebSocket
- Incident/complaint system with escalation
- Analytics and KPI dashboards
- Data retention (no deletion policy)

⏳ **Out of MVP Scope:**

- Payment processing
- Logistics integration
- Advanced supplier verification

## API Response Format

### Success Response

```json
{
  "data": { ... },
  "message": "Success"
}
```

### Error Response

```json
{
	"error": "Error message",
	"message": "Detailed error description"
}
```

## Support

For issues and questions:

- Create an issue in the repository
- Contact: support@scplatform.com

## License

[Your License Here]
