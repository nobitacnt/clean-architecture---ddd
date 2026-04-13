# Clean Architecture + DDD — Order Management System

An Order Management System built with **Clean Architecture** and **Domain-Driven Design (DDD)** using Node.js, TypeScript, and Inversify for Dependency Injection.

---

## Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Request Flow](#request-flow)
- [Testing](#testing)
- [Scripts](#scripts)
- [Business Rules](#business-rules)
- [License](#license)

---

## Architecture

### Layers

| Layer              | Responsibility                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Domain**         | Core business logic — entities, aggregates, value objects, domain events, domain services, and business rules |
| **Application**    | Orchestrates use cases (CQRS commands/queries), event handlers, and ports (interfaces)                        |
| **Infrastructure** | Technical implementations — database repositories, event bus, logger                                          |
| **Presentation**   | Exposes the system — REST controllers/routes and GraphQL resolvers                                            |

### Domain Layer

- **Entities**: `OrderEntity`
- **Aggregates**: `OrderAggregate` (Aggregate Root)
- **Value Objects**: `OrderId`, `OrderStatus`
- **Domain Events**: `OrderCreatedEvent`, `OrderStatusChangedEvent`
- **Domain Services**: `OrderPlacementDomainService`
- **Business Rules**: `OrderCanBeCancelledRule`

### Application Layer

- **Commands**: `PlaceOrderCommand`, `ChangeOrderStatusCommand` (CQRS Write)
- **Queries**: `GetOrderQuery`, `GetOrdersQuery` (CQRS Read)
- **Event Handlers**: `OrderCreatedEventHandler`
- **Ports**: Repository interfaces, `IUnitOfWork`, `IEventDispatcher`

### Infrastructure Layer

- **Repositories**: Prisma-based read/write repository implementations
- **Database**: `PrismaClientManager`, transaction support
- **Event Bus**: In-memory event bus
- **Logger**: `SimpleLogger`

### Presentation Layer

- **REST API**: Express controllers and routes
- **GraphQL API**: Type-GraphQL resolvers
- **DTOs & Mappers**: Request/response transformation

### Design Patterns

- **Clean Architecture** — strict layer separation with dependency inversion
- **Domain-Driven Design** — Aggregate Root, Value Objects, Domain Events
- **CQRS** — separate read and write models
- **Event-Driven Architecture** — Domain Events dispatched via Event Bus
- **Dependency Injection** — Inversify IoC container
- **Repository Pattern** — abstracted data access
- **Unit of Work** — atomic transaction management

---

## Project Structure

```
src/
├── main.ts                        # Entry point
├── server.ts                      # Express + GraphQL server setup
├── modules/
│   ├── order/
│   │   ├── domain/
│   │   │   ├── aggregates/        # OrderAggregate
│   │   │   ├── entities/          # OrderEntity
│   │   │   ├── events/            # Domain events
│   │   │   ├── rules/             # Business rules
│   │   │   ├── services/          # Domain services
│   │   │   └── value-objects/     # OrderId, OrderStatus
│   │   ├── application/
│   │   │   ├── use-cases/         # Commands & Queries
│   │   │   ├── events/            # Event handlers
│   │   │   ├── ports/             # Repository & service interfaces
│   │   │   ├── dtos/              # Input/output DTOs
│   │   │   └── mappers/           # Aggregate ↔ DTO mappers
│   │   ├── infrastructure/
│   │   │   └── repositories/      # Prisma repository implementations
│   │   └── presentation/
│   │       ├── http/              # REST controllers & routes
│   │       └── graphql/           # GraphQL resolvers
│   └── customer/                  # Customer module (same structure)
└── shared/
    ├── common/                    # Constants, DI tokens, errors, utilities
    ├── domain/events/             # Base domain event
    ├── application/ports/         # Shared interfaces (Logger, DB, EventDispatcher)
    ├── infrastructure/            # Shared infrastructure (logger, event bus, database)
    └── presentation/http/         # Base controller

test/
├── unit/
│   ├── domain/                    # Domain layer unit tests
│   └── application/               # Application layer unit tests
└── integration/                   # Integration tests
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd ddd

# 2. Start the database
docker-compose up -d

# 3. Install dependencies
npm install

# 4. Configure environment variables
cp .env.example .env
# Edit DATABASE_URL and other variables in .env

# 5. Generate Prisma Client
npm run prisma:generate

# 6. Run database migrations
npm run prisma:migrate

# 7. Start the development server
npm run dev
```

The server will be available at `http://localhost:3000`.

---

## API Reference

### REST API

#### Create a customer

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer-123@gmail.com",
    "name": "customer-123",
    "creditLimit": 1000
  }'
```

#### Place an order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "f942e2e7-a9b8-4c31-b2c9-8cf573f50f08",
    "items": [
      {
        "productId": "prod-1",
        "productName": "Product 1",
        "quantity": 2,
        "price": 100
      }
    ]
  }'
```

#### Get an order by ID

```bash
curl http://localhost:3000/api/orders/{orderId}
```

#### List orders

```bash
curl "http://localhost:3000/api/orders?page=1&limit=10"
```

#### Change order status

```bash
curl -X PATCH http://localhost:3000/api/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -d '{
    "newStatus": "CONFIRMED"
  }'
```

Valid statuses: `PENDING` · `CONFIRMED` · `PROCESSING` · `SHIPPED` · `DELIVERED` · `CANCELLED`

---

### GraphQL API

Playground available at: `http://localhost:3000/graphql`

#### Place an order

```graphql
mutation {
  createOrder(
    input: {
      customerId: "customer-123"
      items: [{ productId: "prod-1", productName: "Product 1", quantity: 2, price: 100 }]
    }
  ) {
    id
    customerId
    totalAmount
    status
    message
  }
}
```

#### Get an order by ID

```graphql
query {
  order(id: "order-id") {
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

#### List orders

```graphql
query {
  orders(page: 1, limit: 10) {
    id
    customerId
    totalAmount
    status
    createdAt
  }
}
```

#### Change order status

```graphql
mutation {
  changeOrderStatus(
    input: { orderId: "0209ecc7-083b-4160-9aee-9dfb501a89f7", newStatus: "PROCESSING" }
  ) {
    id
    previousStatus
    newStatus
    updatedAt
    message
  }
}
```

---

## Request Flow

### Place Order

```
HTTP Controller  →  validates DTO
  └─▶ PlaceOrderCommand  →  PlaceOrderHandler
        └─▶ OrderAggregate.create()        (domain)
              ├─ raises OrderCreatedEvent
              └─ persisted via WriteRepository
                    └─▶ OrderCreatedEventHandler  (side effects: email, inventory…)
```

### Change Order Status

```
HTTP Controller  →  ChangeOrderStatusCommand  →  Handler
  └─▶ Load OrderAggregate from ReadRepository
        └─▶ aggregate.changeStatus(newStatus)
              ├─ validates business rules
              ├─ raises OrderStatusChangedEvent
              └─ saved and events dispatched
```

### Get Order

```
HTTP Controller  →  GetOrderQuery  →  GetOrderHandler
  └─▶ ReadRepository.findById()
        └─▶ OrderMapper  →  OrderDTO
              └─▶ OrderPresenter  →  HTTP response
```

---

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run a specific test file
npm test -- test/unit/domain/order-status.spec.ts

# Run tests with coverage report
npm test -- --coverage
```

### Test Structure

```
test/
├── unit/
│   ├── domain/
│   │   ├── order-aggregate.spec.ts          # Aggregate creation, status changes, cancellation
│   │   ├── order-status.spec.ts             # Value object validation and transitions
│   │   └── order-placement-domain-service.spec.ts
│   └── application/
│       └── create-order-command.spec.ts     # Use case orchestration
└── integration/
```

---

## Scripts

| Script                    | Description                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| `npm run build`           | Compile TypeScript to `dist/`                                        |
| `npm start`               | Start the production server                                          |
| `npm run dev`             | Start the development server with hot-reload                         |
| `npm run prisma:generate` | Regenerate Prisma Client after schema changes                        |
| `npm run prisma:migrate`  | Apply pending database migrations                                    |
| `npm run prisma:studio`   | Open Prisma Studio (database GUI)                                    |
| `npm run lint:fix`        | Auto-fix all lint errors                                             |
| `npm run lint:ci`         | Check lint — fails on any warning or error (CI use)                  |
| `npm run format:fix`      | Auto-format all files with Prettier                                  |
| `npm run format:ci`       | Check formatting — fails if any file is unformatted (CI use)         |
| `npm run lintAndFormat`   | Run lint:fix then format:fix in sequence                             |
| `npm run typecheck`       | Run TypeScript type checking without emitting files (`tsc --noEmit`) |
| `npm test`                | Run all tests                                                        |
| `npm run test:coverage`   | Run tests with coverage report                                       |
| `npm run test:ci`         | Run tests with coverage in single-thread mode (CI use)               |
| `npm run test:watch`      | Run tests in watch mode                                              |
| `npm run prepare`         | Set up Husky git hooks (runs automatically after `npm install`)      |

---

## Business Rules

### Order Status Transitions

```
PENDING   ──▶  CONFIRMED  ──▶  PROCESSING  ──▶  SHIPPED  ──▶  DELIVERED
   │               │                │
   └──▶ CANCELLED  └──▶ CANCELLED   └──▶ CANCELLED
```

| From         | Allowed transitions       |
| ------------ | ------------------------- |
| `PENDING`    | `CONFIRMED`, `CANCELLED`  |
| `CONFIRMED`  | `PROCESSING`, `CANCELLED` |
| `PROCESSING` | `SHIPPED`, `CANCELLED`    |
| `SHIPPED`    | `DELIVERED`               |
| `DELIVERED`  | — (terminal state)        |
| `CANCELLED`  | — (terminal state)        |

### Cancellation Rules

- An order in `DELIVERED` state cannot be cancelled.
- An order already in `CANCELLED` state cannot be cancelled again.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

## Author

TuyenHV
