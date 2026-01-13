# Clean Architecture + DDD - Technical Documentation

## 🏛️ Architecture Overview

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────────────┐    ┌─────────────────────────┐   │
│  │   HTTP Controllers   │    │   GraphQL Resolvers     │   │
│  │   - OrderController  │    │   - OrderResolver       │   │
│  │   - Routes           │    │   - Schemas & Inputs    │   │
│  │   - DTOs             │    │                         │   │
│  └──────────┬───────────┘    └────────────┬────────────┘   │
└─────────────┼──────────────────────────────┼────────────────┘
              │                              │
              ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  ┌──────────────────────┐    ┌─────────────────────────┐   │
│  │   Command Handlers   │    │    Query Handlers       │   │
│  │   - CreateOrder      │    │    - GetOrder           │   │
│  │   - UpdateOrder      │    │    - ListOrders         │   │
│  └──────────┬───────────┘    └────────────┬────────────┘   │
│             │                              │                 │
│  ┌──────────┴──────────────────────────────┴────────────┐   │
│  │              Event Handlers                          │   │
│  │              - OrderCreatedHandler                   │   │
│  └──────────────────────────┬───────────────────────────┘   │
└─────────────────────────────┼─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Aggregate Root                          │   │
│  │              - OrderAggregate                        │   │
│  │                     │                                │   │
│  │    ┌────────────────┼────────────────┐              │   │
│  │    ▼                ▼                ▼              │   │
│  │ Entities      Value Objects      Events             │   │
│  │ - Order       - OrderId          - OrderCreated     │   │
│  │               - OrderStatus      - StatusChanged    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Domain Services & Business Rules            │   │
│  │         - OrderDomainService                        │   │
│  │         - OrderCanBeCancelledRule                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                       │
│  ┌──────────────────────┐    ┌─────────────────────────┐   │
│  │   Repositories       │    │   Event Bus             │   │
│  │   - OrderRepository  │    │   - InMemoryEventBus    │   │
│  │   - Prisma ORM       │    │   - Event Registrar     │   │
│  └──────────────────────┘    └─────────────────────────┘   │
│  ┌──────────────────────┐    ┌─────────────────────────┐   │
│  │   Database           │    │   DI Container          │   │
│  │   - PostgreSQL       │    │   - Inversify           │   │
│  │   - Prisma Schema    │    │   - Module Loader       │   │
│  └──────────────────────┘    └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Design Patterns

### 1. Clean Architecture
- **Dependency Rule**: Dependencies point inward
- **Layer Independence**: Each layer has clear boundaries
- **Business Logic Isolation**: Domain layer is framework-agnostic

### 2. Domain-Driven Design (DDD)
- **Aggregate Root**: OrderAggregate manages consistency
- **Value Objects**: Immutable objects (OrderId, OrderStatus)
- **Domain Events**: OrderCreated, OrderStatusChanged
- **Ubiquitous Language**: Business terms in code

### 3. CQRS (Command Query Responsibility Segregation)
- **Commands**: Write operations (CreateOrder, UpdateOrder)
- **Queries**: Read operations (GetOrder, ListOrders)
- **Separation**: Different models for reads and writes

### 4. Event-Driven Architecture
- **Domain Events**: Raised by aggregates
- **Event Bus**: In-memory event dispatcher
- **Event Handlers**: Side effects and notifications

### 5. Repository Pattern
- **Interface**: IOrderRepository in application layer
- **Implementation**: OrderRepositoryImpl in infrastructure
- **Abstraction**: Hides data access details

### 6. Unit of Work Pattern
- **Transaction Management**: Ensures atomicity
- **Event Dispatching**: After successful commit
- **Consistency**: Maintains data integrity

## 🔄 Data Flow

### Create Order Flow

```
1. HTTP POST /api/orders
   ↓
2. OrderController.createOrder()
   ↓
3. Validate CreateOrderRequestDto
   ↓
4. CreateOrderCommand
   ↓
5. CreateOrderHandler.execute()
   ↓
6. OrderAggregate.create()
   ├─ Create OrderEntity
   ├─ Calculate total
   └─ Raise OrderCreatedEvent
   ↓
7. OrderRepository.save()
   ├─ Persist to database
   └─ Within transaction
   ↓
8. UnitOfWork.dispatchEvents()
   ├─ Publish to EventBus
   └─ OrderCreatedEventHandler
       ├─ Send email
       ├─ Reserve inventory
       └─ Notify systems
   ↓
9. Return CreateOrderResult
   ↓
10. OrderPresenter.presentCreated()
   ↓
11. HTTP 201 Response
```

### Change Order Status Flow

```
1. Load OrderAggregate
   ↓
2. Validate business rules
   ├─ Cannot modify cancelled orders
   ├─ Check valid transitions
   └─ OrderCanBeCancelledRule
   ↓
3. OrderAggregate.changeStatus()
   ├─ Update status
   └─ Raise OrderStatusChangedEvent
   ↓
4. Save & Dispatch Events
   ↓
5. Event Handlers execute
```

## 📦 Module Structure

### Domain Layer (Business Logic)
```typescript
// Aggregate Root - Consistency boundary
class OrderAggregate extends AggregateRoot {
  create() { /* raises OrderCreatedEvent */ }
  changeStatus() { /* raises OrderStatusChangedEvent */ }
  cancel() { /* applies business rules */ }
}

// Value Object - Immutable
class OrderStatus {
  canTransitionTo(newStatus) { /* validation */ }
}

// Domain Event
class OrderCreatedEvent extends DomainEvent {
  getEventName() { return 'OrderCreated'; }
}
```

### Application Layer (Use Cases)
```typescript
// Command Handler (Write)
class CreateOrderHandler {
  execute(command: CreateOrderCommand): Promise<CreateOrderResult> {
    // 1. Create aggregate
    // 2. Save to repository
    // 3. Dispatch events
  }
}

// Query Handler (Read)
class GetOrderHandler {
  execute(query: GetOrderQuery): Promise<OrderDto> {
    // 1. Load from repository
    // 2. Map to DTO
    // 3. Return
  }
}
```

### Infrastructure Layer (Technical Details)
```typescript
// Repository Implementation
class OrderRepositoryImpl implements IOrderRepository {
  async save(order: OrderAggregate): Promise<void> {
    // Prisma ORM operations
  }
}

// Unit of Work
class PrismaUnitOfWork implements IUnitOfWork {
  async execute<T>(work: () => Promise<T>): Promise<T> {
    // Transaction management
  }
}
```

### Presentation Layer (API)
```typescript
// HTTP Controller
class OrderController {
  async createOrder(req: Request, res: Response) {
    // 1. Validate DTO
    // 2. Execute command
    // 3. Present response
  }
}

// GraphQL Resolver
@Resolver()
class OrderResolver {
  @Mutation()
  async createOrder(@Arg('input') input: CreateOrderInput) {
    // Similar to HTTP
  }
}
```

## 🔐 Dependency Injection

### Container Setup
```typescript
// 1. Common modules
loadCommonModules(container);
  ├─ Logger
  ├─ EventBus
  └─ DomainEventsDispatcher

// 2. Order module
loadOrderModule(container);
  ├─ Repositories
  ├─ Handlers (Command & Query)
  ├─ Event Handlers
  └─ Domain Services

// 3. Presentation
  ├─ Controllers
  └─ Resolvers
```

## 🎪 Event System

### Event Flow
```
Domain Operation
    ↓
Raise Domain Event (in Aggregate)
    ↓
Store in Aggregate's event collection
    ↓
Save Aggregate (Repository)
    ↓
Dispatch Events (UnitOfWork)
    ↓
Publish to EventBus
    ↓
Event Handlers execute
    ↓
Side effects (email, notifications, etc.)
```

### Event Registration
```typescript
// Infrastructure layer
eventBus.subscribe('OrderCreated', async (event) => {
  await orderCreatedHandler.handle(event);
});

eventBus.subscribe('OrderStatusChanged', async (event) => {
  // Handle status change
});
```

## 🧪 Testing Strategy

### Unit Tests
- Domain entities and value objects
- Business rules validation
- Aggregate behavior

### Integration Tests
- Repository implementations
- Event dispatching
- Database operations

### E2E Tests
- HTTP endpoints
- GraphQL queries/mutations
- Complete workflows

## 🚀 Scalability Considerations

### Current Architecture
- ✅ Monolithic but modular
- ✅ Easy to understand and maintain
- ✅ Fast development

### Future Extensions
- 🔄 Extract modules into microservices
- 🔄 Replace in-memory EventBus with RabbitMQ/Kafka
- 🔄 Add CQRS read models (separate read database)
- 🔄 Implement Event Sourcing
- 🔄 Add API Gateway

## 📚 Further Reading

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design by Eric Evans](https://domainlanguage.com/ddd/)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)

---

**Author**: Clean Architecture + DDD Team  
**Last Updated**: January 2026
