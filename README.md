# Clean Architecture + DDD Order Management System

Dự án Order Management được xây dựng với **Clean Architecture** kết hợp **Domain-Driven Design (DDD)**, sử dụng Node.js, TypeScript, và Inversify cho Dependency Injection.

## Kiến trúc

### Các Layer

1. **Domain Layer** - Lõi nghiệp vụ
   - Entities: Order Entity
   - Aggregates: Order Aggregate Root
   - Value Objects: OrderId, OrderStatus
   - Domain Events: OrderCreated, OrderStatusChanged
   - Domain Services: OrderDomainService
   - Business Rules: OrderCanBeCancelledRule

2. **Application Layer** - Use Cases
   - Commands: CreateOrder (CQRS Write)
   - Queries: GetOrder (CQRS Read)
   - Event Handlers: OrderCreatedEventHandler
   - Ports: Repository Interfaces, UnitOfWork

3. **Infrastructure Layer** - Technical Implementation
   - Repositories
   - Database
   - Event bus
   - Logger

4. **Presentation Layer** - API
   - HTTP REST API: Express Controllers & Routes
   - GraphQL API: Type-GraphQL Resolvers
   - DTOs & Presenters

### Patterns được áp dụng

- **Clean Architecture** - Phân tách rõ ràng các layer
- **Domain-Driven Design** - Aggregate Root, Value Objects, Domain Events
- **CQRS** - Tách biệt Command và Query
- **Event-Driven Architecture** - Domain Events với Event Bus
- **Dependency Injection** - Inversify Container
- **Repository Pattern** - Trừu tượng hóa data access
- **Unit of Work** - Quản lý transactions

##  Cài đặt

### Yêu cầu

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

### Các bước cài đặt
- Nếu muốn làm thủ công thì theo các bước sau:

```bash
# 1. Clone repository
git clone <your-repo-url>
cd ddd
docker-compose up -d

# 2. Cài đặt dependencies
npm install

# 3. Setup database
cp .env.example .env
# Chỉnh sửa DATABASE_URL trong file .env

# 4. Generate Prisma Client
npm run prisma:generate

# 5. Run migrations
npm run prisma:migrate

# 6. Start development server
npm run dev
```



## Sử dụng

### REST API

#### Tạo khách hàng

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer-123@gmail.com",
    "name": "customer-123",
    "creditLimit": 1000
  }'
```

#### Tạo đơn hàng

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

#### Lấy thông tin đơn hàng

```bash
curl http://localhost:3000/api/orders/{orderId}
```

#### Lấy danh sách đơn hàng

```bash
curl "http://localhost:3000/api/orders?page=1&limit=10"
```

#### Thay đổi trạng thái đơn hàng

```bash
curl -X PATCH http://localhost:3000/api/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -d '{
    "newStatus": "CONFIRMED"
  }'
```

Các trạng thái hợp lệ: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

### GraphQL API

GraphQL Playground: `http://localhost:3000/graphql`

#### Tạo đơn hàng

```graphql
mutation {
  createOrder(input: {
    customerId: "customer-123"
    items: [
      {
        productId: "prod-1"
        productName: "Product 1"
        quantity: 2
        price: 100
      }
    ]
  }) {
    id
    customerId
    totalAmount
    status
    message
  }
}
```

#### Lấy thông tin đơn hàng

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

#### Lấy danh sách đơn hàng

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

#### Thay đổi trạng thái đơn hàng

```graphql
mutation ChangeOrderStatus {
    changeOrderStatus(input: { orderId: "0209ecc7-083b-4160-9aee-9dfb501a89f7", newStatus: "PROCESSING" }) {
        id
        previousStatus
        newStatus
        updatedAt
        message
    }
}
```

## Luồng xử lý

### Tạo đơn hàng (Create Order)

1. **HTTP Controller** nhận request → validate DTO
2. **CreateOrderCommand** được tạo và gửi đến **CreateOrderHandler**
3. **Handler** tạo **OrderAggregate** (Domain)
4. **Aggregate** raise **OrderCreatedEvent** (Domain Event)
5. **Repository** lưu Order vào database
7. **OrderCreatedEventHandler** xử lý side effects (email, inventory, etc.)
8. Response trả về client

### Thay đổi trạng thái đơn (Change Order Status)

1. Load **OrderAggregate** từ Repository
2. Gọi `aggregate.changeStatus(newStatus)`
3. Aggregate validate business rules
4. Nếu hợp lệ: cập nhật status và raise **OrderStatusChangedEvent**
5. Save aggregate và dispatch events
6. Event handlers xử lý side effects

### Lấy thông tin đơn (Get Order)

1. **GetOrderQuery** được gửi đến **GetOrderHandler**
2. Handler gọi Repository để load aggregate
3. **OrderMapper** convert aggregate sang DTO
4. **OrderPresenter** format dữ liệu cho presentation layer
5. Response trả về client

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- test/unit/domain/order-status.spec.ts

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

```
test/
├── unit/                     # Unit tests
│   ├── domain/              # Domain layer tests
│   │   ├── order-aggregate.spec.ts
│   │   └── order-status.spec.ts
│   └── application/         # Application layer tests
│       └── create-order-command.spec.ts
└── integration/             # Integration tests
```

### Available Tests

- **Domain Layer Tests**
  - OrderAggregate: Tạo order, thay đổi trạng thái, cancel order
  - OrderStatus: Value object validation và status transitions
  
- **Application Layer Tests**
  - CreateOrderCommand: Use case tạo order
  - (Có thể thêm tests cho các commands/queries khác)

## Scripts

- `npm run build` - Build production
- `npm start` - Start production server
- `npm run dev` - Start development server với hot-reload
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run lint` - Lint code
- `npm run format` - Format code với Prettier

##  Business Rules

### Order Status Transitions

- `PENDING` → `CONFIRMED` hoặc `CANCELLED`
- `CONFIRMED` → `PROCESSING` hoặc `CANCELLED`
- `PROCESSING` → `SHIPPED` hoặc `CANCELLED`
- `SHIPPED` → `DELIVERED`
- `DELIVERED` → (không thể chuyển)
- `CANCELLED` → (không thể chuyển)

### Cancellation Rules

- Không thể cancel đơn đã DELIVERED
- Không thể cancel đơn đã CANCELLED

## License

MIT License

## Author

TuyenHV
