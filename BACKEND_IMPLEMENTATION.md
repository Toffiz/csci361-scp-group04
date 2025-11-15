# Supply Chain Platform - Backend Implementation

## Overview

A comprehensive Go backend for a Consumer-Supplier Communication Platform targeting the Kazakhstan market. The platform enables direct communication, order management, and complaint handling between consumers and suppliers, particularly focused on perishable goods (dairy, fish, meat).

## Architecture

### Technology Stack

- **Language**: Go 1.23
- **Web Framework**: Gin (high-performance HTTP router)
- **ORM**: GORM with PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: WebSocket (gorilla/websocket)
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose

### Project Structure

```
backend/
├── main.go                 # Application entry point
├── config/                 # Configuration management
│   └── config.go          # Environment-based config
├── database/              # Database layer
│   └── database.go        # Connection & migrations
├── models/                # Data models
│   └── models.go          # All database models
├── handlers/              # HTTP request handlers
│   ├── auth.go           # Authentication (login, register, JWT)
│   ├── user.go           # User management
│   ├── supplier.go       # Supplier operations
│   ├── consumer.go       # Consumer operations
│   ├── product.go        # Product catalog management
│   ├── order.go          # Order processing
│   ├── chat.go           # Chat messaging
│   ├── incident.go       # Incident/complaint management
│   └── analytics.go      # Analytics & KPIs
├── middleware/            # HTTP middleware
│   └── middleware.go     # Auth, logging, error handling
├── routes/                # API routes
│   └── routes.go         # Route registration
├── websocket/             # WebSocket implementation
│   └── websocket.go      # Real-time chat hub
├── Dockerfile            # Docker configuration
├── Makefile              # Build & development commands
├── .env.example          # Environment template
└── README.md             # Documentation
```

## Key Features Implemented

### 1. Authentication & Authorization

- **Multi-role system**: Consumer, Sales, Admin, Owner, Platform Admin
- **JWT-based authentication** with access & refresh tokens
- **Role-based access control** via middleware
- **Password hashing** using bcrypt
- **Token expiration**: 1 hour (access), 7 days (refresh)

### 2. User Management

- User registration with email/password
- Profile management (update, avatar upload)
- User CRUD operations (admin only)
- Soft delete support

### 3. Supplier Management

- Supplier registration during user signup
- Link request approval/denial system
- Supplier verification (platform admin)
- Subscription management
- Supplier suspension capabilities

### 4. Consumer Features

- Browse available suppliers
- Request supplier links
- View approved supplier connections
- Access linked supplier products
- Place orders
- View order history
- Create complaints/incidents

### 5. Product Catalog

- Hierarchical categories (with parent-child relationships)
- Product CRUD operations
- Inventory tracking (stock levels, min stock alerts)
- Product images (prepared for S3 upload)
- Price management with currency support
- SKU management
- Product filtering by category/supplier

### 6. Order Management

- Order creation with multiple items
- Order status tracking (pending → confirmed → shipped → delivered)
- Order history for consumers
- Order management for suppliers
- Total calculation with currency support (KZT)
- Order cancellation support

### 7. Real-time Chat System

- WebSocket-based real-time communication
- Chat between linked consumer-supplier pairs
- Message history with pagination
- Read receipts functionality
- Typing indicators (prepared)
- File attachments support
- Chat escalation to admin level
- System messages for events

### 8. Incident Management

- Complaint creation by consumers
- Priority levels (low, medium, high, urgent)
- Status tracking (open → in_progress → escalated → resolved → closed)
- Assignment to support staff
- Escalation workflow
- Incident logging/audit trail
- Resolution tracking with timestamps
- Export capabilities for reporting

### 9. Analytics & Reporting

- **Dashboard KPIs**:

  - Order count & GMV (Gross Merchandise Value)
  - Average order value
  - Active consumer count
  - Pending/resolved incidents
  - Top products by revenue
  - Recent orders

- **Detailed Metrics**:
  - Order metrics (total, cancelled, average value)
  - Customer metrics (total, repeat customers, reorder rate)
  - Service metrics (average response time)
  - Complaint reports with breakdowns
- **Platform Analytics** (admin):
  - Supplier statistics
  - Consumer statistics
  - Total revenue

### 10. Data Model

**Core Entities:**

- `User` - Base user accounts with roles
- `Supplier` - Supplier companies
- `Consumer` - Consumer profiles
- `ConsumerSupplierLink` - Approved connections
- `Product` - Inventory items
- `Category` - Product categories
- `Order` - Customer orders
- `OrderItem` - Order line items
- `Chat` - Chat conversations
- `Message` - Individual messages
- `MessageAttachment` - File attachments
- `Incident` - Complaints/issues
- `IncidentLog` - Audit trail
- `Subscription` - Supplier subscriptions
- `Analytics` - KPI metrics
- `Notification` - User notifications

All models include:

- UUID for external identification
- Timestamps (created_at, updated_at)
- Soft delete support (deleted_at)
- GORM associations

## API Endpoints

### Public Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/categories` - List categories

### Consumer Endpoints (role: consumer)

- Supplier browsing & linking
- Product catalog access
- Order management
- Chat access
- Incident creation

### Sales Endpoints (role: sales)

- Link request management
- Order processing
- Chat management
- Incident handling

### Admin Endpoints (role: admin, owner)

- User management
- Product management
- Category management
- Full order visibility
- Analytics dashboard
- Incident resolution
- Subscription management

### Owner Endpoints (role: owner)

- Advanced reports
- Chat transcript exports
- Incident exports

### Platform Admin Endpoints (role: platform_admin)

- Supplier verification
- Platform-wide analytics
- Subscription oversight

## Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcrypt with salt
3. **Role-Based Access Control** - Middleware enforced
4. **CORS Configuration** - Configurable allowed origins
5. **SQL Injection Protection** - GORM parameterized queries
6. **Environment Variables** - Sensitive data in .env
7. **HTTPS Ready** - Production deployment ready

## Database Schema

PostgreSQL database with the following relationships:

- User ↔ Consumer (1:1)
- User ↔ Supplier (many:1)
- Consumer ↔ Supplier (many:many via ConsumerSupplierLink)
- Supplier → Product (1:many)
- Consumer → Order (1:many)
- Supplier → Order (1:many)
- Order → OrderItem (1:many)
- Consumer ↔ Supplier → Chat (1:1)
- Chat → Message (1:many)
- Message → MessageAttachment (1:many)
- Consumer → Incident (1:many)
- Supplier → Incident (1:many)
- Incident → IncidentLog (1:many)
- Supplier → Subscription (1:1)

## MVP Compliance

✅ **Required by November 20, 2025:**

1. ✅ Chat between linked consumers and suppliers
2. ✅ File & audio sharing support
3. ✅ Inventory with prices visible to consumers
4. ✅ Incident handling with escalation workflow
5. ✅ Consumer → Sales → Admin escalation path
6. ✅ Read receipts & typing indicators (infrastructure ready)
7. ✅ Data retention (no deletion, archival ready)

❌ **Out of MVP Scope:**

- Payment processing
- Logistics integration
- Advanced supplier verification (post-MVP)

## Deployment

### Local Development

```bash
# Set up environment
cp backend/.env.example backend/.env
# Edit .env with your settings

# Run with Go
cd backend
go run main.go

# Or use Make
make run
```

### Docker Development

```bash
# Start all services
docker-compose up --build

# Backend: http://localhost:5000
# Frontend: http://localhost:3000
# PostgreSQL: localhost:5432
```

### Production Deployment

1. Update `.env` with production values
2. Set `ENVIRONMENT=production`
3. Use secure `JWT_SECRET`
4. Configure production database
5. Enable HTTPS
6. Set up monitoring
7. Configure backup strategy

## Performance Considerations

- **Database Indexing**: UUID, email, foreign keys indexed
- **Pagination**: All list endpoints support pagination
- **Eager Loading**: Strategic use of GORM Preload
- **Connection Pooling**: GORM connection pool
- **WebSocket**: Goroutine-based concurrent handling
- **Middleware**: Minimal overhead, async logging

## Testing Strategy

- Unit tests for handlers
- Integration tests for database operations
- API endpoint tests
- WebSocket connection tests
- Load testing for concurrent users

## Future Enhancements

1. **Payment Integration**: Stripe/local payment gateway
2. **File Storage**: AWS S3 or local storage implementation
3. **Email Notifications**: SendGrid/SMTP integration
4. **SMS Notifications**: Twilio integration
5. **Advanced Analytics**: Time-series data, forecasting
6. **Export Features**: PDF reports, CSV exports
7. **Search**: Elasticsearch integration
8. **Caching**: Redis for session/data caching
9. **Rate Limiting**: API rate limiting middleware
10. **API Versioning**: Support for v2, v3, etc.

## Maintenance

- Database migrations automated via GORM
- Logs stored for debugging
- Health check endpoint: `GET /health`
- Environment-based configuration
- Backward compatibility maintained

## Documentation

- API documentation in README.md
- Code comments for complex logic
- Swagger/OpenAPI annotations (ready for generation)
- Environment variable documentation

## Support & Contact

For issues, questions, or contributions, please refer to the project repository.

---

**Built with ❤️ for the Kazakhstan market**
**Target Launch: November 20, 2025**
