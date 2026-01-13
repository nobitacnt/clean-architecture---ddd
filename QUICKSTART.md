# Quick Start Guide

## 📋 Prerequisites

Đảm bảo bạn đã cài đặt:
- Node.js v18+ 
- PostgreSQL v14+
- npm hoặc yarn

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env and update DATABASE_URL
# Example: DATABASE_URL="postgresql://user:password@localhost:5432/order_db"
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Server sẽ chạy tại:
- REST API: http://localhost:3000/api
- GraphQL: http://localhost:3000/graphql
- Health Check: http://localhost:3000/health

## 🧪 Testing APIs

### Using cURL (REST API)

**Create Order:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust-001",
    "items": [
      {
        "productId": "prod-001",
        "productName": "iPhone 15 Pro",
        "quantity": 1,
        "price": 999.99
      },
      {
        "productId": "prod-002",
        "productName": "AirPods Pro",
        "quantity": 2,
        "price": 249.99
      }
    ]
  }'
```

**Get Order:**
```bash
curl http://localhost:3000/api/orders/{order-id}
```

**Get All Orders:**
```bash
curl http://localhost:3000/api/orders?page=1&limit=10
```

### Using GraphQL Playground

Open http://localhost:3000/graphql

**Create Order:**
```graphql
mutation CreateOrder {
  createOrder(input: {
    customerId: "cust-001"
    items: [
      {
        productId: "prod-001"
        productName: "iPhone 15 Pro"
        quantity: 1
        price: 999.99
      },
      {
        productId: "prod-002"
        productName: "AirPods Pro"
        quantity: 2
        price: 249.99
      }
    ]
  }) {
    id
    customerId
    totalAmount
    status
    createdAt
    message
  }
}
```

**Get Order:**
```graphql
query GetOrder {
  order(id: "your-order-id") {
    id
    customerId
    items {
      productId
      productName
      quantity
      price
      subtotal
    }
    totalAmount
    status
    createdAt
    updatedAt
  }
}
```

**Get All Orders:**
```graphql
query GetOrders {
  orders(page: 1, limit: 10) {
    id
    customerId
    totalAmount
    status
    createdAt
  }
}
```

## 🔍 Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Create database if not exists
createdb order_db
```

### Port Already in Use

```bash
# Change PORT in .env file
PORT=3001
```

### Prisma Client Not Generated

```bash
npm run prisma:generate
```

## 📚 Next Steps

- Explore the codebase structure in `src/`
- Read the full README.md for architecture details
- Check domain business rules in `src/modules/order/domain/`
- Modify and extend the Order module as needed

## 🛠️ Development Commands

```bash
# Development with hot-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Database commands
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open database GUI
```

## 📝 Project Structure Overview

```
src/
├── common/              # Shared infrastructure
│   ├── di/             # Dependency Injection
│   ├── event/          # Event Bus
│   ├── logger/         # Logging
│   └── errors/         # Errors
│
├── modules/order/       # Order Bounded Context
│   ├── domain/         # 💎 Business Logic
│   ├── application/    # 🎯 Use Cases
│   ├── infrastructure/ # 🔧 Technical Details
│   └── presentation/   # 🌐 API Layer
│
├── server.ts           # Server setup
└── main.ts             # Entry point
```

Happy coding! 🎉
