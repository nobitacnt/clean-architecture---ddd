# Clean Architecture + DDD Order Management System

Dự án Order Management được xây dựng với **Clean Architecture** kết hợp **Domain-Driven Design (DDD)**, sử dụng Node.js, TypeScript, và Inversify cho Dependency Injection.

## 🏗️ Kiến trúc

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
   - Persistence: Prisma ORM
   - Repositories: OrderRepositoryImpl
   - Event Registration: OrderEventHandlersRegistrar
   - DI Module: OrderModule

4. **Presentation Layer** - API
   - HTTP REST API: Express Controllers & Routes
   - GraphQL API: Type-GraphQL Resolvers
   - DTOs & Presenters

### Patterns được áp dụng

- ✅ **Clean Architecture** - Phân tách rõ ràng các layer
- ✅ **Domain-Driven Design** - Aggregate Root, Value Objects, Domain Events
- ✅ **CQRS** - Tách biệt Command và Query
- ✅ **Event-Driven Architecture** - Domain Events với Event Bus
- ✅ **Dependency Injection** - Inversify Container
- ✅ **Repository Pattern** - Trừu tượng hóa data access
- ✅ **Unit of Work** - Quản lý transactions

## 🚀 Cài đặt

### Yêu cầu

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

### Các bước cài đặt

```bash
# 1. Clone repository
git clone <your-repo-url>
cd ddd

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

## 📝 Sử dụng

### REST API

#### Tạo đơn hàng

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
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
curl http://localhost:3000/api/orders?page=1&limit=10
```

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

## 🔄 Luồng xử lý

### Tạo đơn hàng (Create Order)

1. **HTTP Controller** nhận request → validate DTO
2. **CreateOrderCommand** được tạo và gửi đến **CreateOrderHandler**
3. **Handler** tạo **OrderAggregate** (Domain)
4. **Aggregate** raise **OrderCreatedEvent** (Domain Event)
5. **Repository** lưu Order vào database
6. **UnitOfWork** dispatch events thông qua **EventBus**
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

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Scripts

- `npm run build` - Build production
- `npm start` - Start production server
- `npm run dev` - Start development server với hot-reload
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run lint` - Lint code
- `npm run format` - Format code với Prettier

## 🗂️ Cấu trúc thư mục

```
src/
├── common/                  # Shared infrastructure
│   ├── di/                 # Dependency Injection
│   ├── event/              # Event Bus & Domain Events
│   ├── logger/             # Logging
│   ├── errors/             # Base errors
│   └── utils/              # Utilities
├── modules/
│   └── order/              # Order Module
│       ├── domain/         # Domain Layer
│       ├── application/    # Application Layer
│       ├── infrastructure/ # Infrastructure Layer
│       └── presentation/   # Presentation Layer
├── server.ts               # Server setup
└── main.ts                 # Entry point
```

## 🎯 Business Rules

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

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License

## 👨‍💻 Author

Your Name
