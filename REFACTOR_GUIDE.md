# 🔄 Application Layer Restructure - Use Cases & DTOs

## 📋 Changes Summary

Dự án đã được **refactor lại Application layer** theo các best practices:

### ✅ What Changed

1. **Use Cases Structure** - Di chuyển Commands & Queries vào `use-cases/`
2. **DTOs with Zod** - Request/Response DTOs với Zod validation
3. **Cleaner Separation** - Tách biệt rõ ràng giữa use-cases và DTOs

## 📁 New Structure

```
src/modules/order/application/
├── dtos/                                    # 📦 Data Transfer Objects
│   ├── create-order.request.dto.ts         # Request DTO with Zod schema
│   ├── order.response.dto.ts               # Response DTOs
│   ├── get-order.request.dto.ts            # Get order request DTO
│   └── change-order-status.request.dto.ts  # Change status request DTO
│
├── use-cases/                              # 🎯 Use Cases (Commands & Queries)
│   ├── create-order/
│   │   └── create-order.use-case.ts       # Create order use case
│   ├── get-order/
│   │   └── get-order.use-case.ts          # Get order use case
│   └── change-order-status/
│       └── change-order-status.use-case.ts # Change status use case
│
├── event-handlers/                         # 🎪 Event Handlers
│   └── order-created.handler.ts
│
├── ports/                                  # 🔌 Ports (Interfaces)
│   ├── repositories/
│   │   └── order.repository.ts
│   └── unit-of-work.ts
│
├── mappers/                                # 🔄 Mappers (deprecated)
│   └── order.mapper.ts
│
└── errors/                                 # ⚠️ Application Errors
    └── order.application-error.ts
```

## 🆕 DTOs with Zod Validation

### Request DTOs

**Create Order Request:**
```typescript
import { z } from 'zod';

export const CreateOrderRequestSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      productName: z.string().min(1, 'Product name is required'),
      quantity: z.number().int().positive(),
      price: z.number().nonnegative(),
    })
  ).min(1, 'At least one item is required'),
});

export type CreateOrderRequestDto = z.infer<typeof CreateOrderRequestSchema>;
```

**Get Order Request:**
```typescript
export const GetOrderRequestSchema = z.object({
  orderId: z.string().uuid('Order ID must be a valid UUID'),
});

export type GetOrderRequestDto = z.infer<typeof GetOrderRequestSchema>;
```

**Change Status Request:**
```typescript
export const ChangeOrderStatusRequestSchema = z.object({
  orderId: z.string().uuid(),
  newStatus: z.enum(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export type ChangeOrderStatusRequestDto = z.infer<typeof ChangeOrderStatusRequestSchema>;
```

### Response DTOs

```typescript
// Create Order Response
export interface CreateOrderResponseDto {
  id: string;
  customerId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  message: string;
}

// Order Response
export interface OrderResponseDto {
  id: string;
  customerId: string;
  items: OrderItemResponseDto[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Change Status Response
export interface ChangeOrderStatusResponseDto {
  id: string;
  previousStatus: string;
  newStatus: string;
  updatedAt: string;
  message: string;
}
```

## 🎯 Use Cases (Replacing Commands/Queries)

### Create Order Use Case

```typescript
@injectable()
export class CreateOrderUseCase {
  async execute(request: CreateOrderRequestDto): Promise<CreateOrderResponseDto> {
    // 1. Validate với Zod
    const validatedRequest = CreateOrderRequestSchema.parse(request);
    
    // 2. Create aggregate
    const orderAggregate = OrderAggregate.create(
      validatedRequest.customerId,
      validatedRequest.items
    );
    
    // 3. Save & dispatch events
    await this.unitOfWork.execute(async () => {
      await this.orderRepository.save(orderAggregate);
      await this.unitOfWork.dispatchEvents([orderAggregate]);
    });
    
    // 4. Return response DTO
    return {
      id: orderAggregate.id.toString(),
      customerId: orderAggregate.customerId,
      totalAmount: orderAggregate.totalAmount,
      status: orderAggregate.status.toString(),
      createdAt: orderAggregate.createdAt.toISOString(),
      message: 'Order created successfully',
    };
  }
}
```

### Get Order Use Case

```typescript
@injectable()
export class GetOrderUseCase {
  async execute(request: GetOrderRequestDto): Promise<OrderResponseDto> {
    // Validate với Zod
    const validatedRequest = GetOrderRequestSchema.parse(request);
    
    // Load order
    const order = await this.orderRepository.findById(validatedRequest.orderId);
    
    if (!order) {
      throw new OrderNotFoundError(validatedRequest.orderId);
    }
    
    // Map to response DTO
    return {
      id: order.id.toString(),
      customerId: order.customerId,
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
      totalAmount: order.totalAmount,
      status: order.status.toString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
  
  async executeList(request: GetOrdersListRequestDto): Promise<OrdersListResponseDto> {
    // Similar implementation for list
  }
}
```

## 🔧 Controller Updates

### HTTP Controller (Express)

```typescript
@injectable()
export class OrderController {
  constructor(
    @inject(TYPES.CreateOrderUseCase) private readonly createOrderUseCase: CreateOrderUseCase,
    @inject(TYPES.GetOrderUseCase) private readonly getOrderUseCase: GetOrderUseCase,
    @inject(TYPES.ChangeOrderStatusUseCase) private readonly changeOrderStatusUseCase: ChangeOrderStatusUseCase,
  ) {}

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      // Validation happens inside use case with Zod
      const result = await this.createOrderUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      // Handle other errors
    }
  }

  async changeOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.changeOrderStatusUseCase.execute({
        orderId: req.params.id,
        newStatus: req.body.newStatus,
      });
      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error, 'Error changing order status');
    }
  }
}
```

### GraphQL Resolver

```typescript
@injectable()
@Resolver(() => OrderType)
export class OrderResolver {
  constructor(
    @inject(TYPES.CreateOrderUseCase) private readonly createOrderUseCase: CreateOrderUseCase,
    @inject(TYPES.GetOrderUseCase) private readonly getOrderUseCase: GetOrderUseCase,
    @inject(TYPES.ChangeOrderStatusUseCase) private readonly changeOrderStatusUseCase: ChangeOrderStatusUseCase,
  ) {}

  @Mutation(() => CreateOrderResultType)
  async createOrder(@Arg('input') input: CreateOrderInput): Promise<CreateOrderResultType> {
    const result = await this.createOrderUseCase.execute({
      customerId: input.customerId,
      items: input.items,
    });
    return result as CreateOrderResultType;
  }

  @Mutation(() => ChangeOrderStatusResultType)
  async changeOrderStatus(@Arg('input') input: ChangeOrderStatusInput) {
    const result = await this.changeOrderStatusUseCase.execute({
      orderId: input.orderId,
      newStatus: input.newStatus,
    });
    return result as ChangeOrderStatusResultType;
  }
}
```

## 📡 Updated API Examples

### REST API

**Create Order:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-001",
    "items": [{
      "productId": "prod-001",
      "productName": "Product 1",
      "quantity": 2,
      "price": 100
    }]
  }'
```

**Change Order Status:**
```bash
curl -X PATCH http://localhost:3000/api/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -d '{
    "newStatus": "CONFIRMED"
  }'
```

### GraphQL API

**Create Order:**
```graphql
mutation {
  createOrder(input: {
    customerId: "customer-001"
    items: [{
      productId: "prod-001"
      productName: "Product 1"
      quantity: 2
      price: 100
    }]
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

**Change Order Status:**
```graphql
mutation {
  changeOrderStatus(input: {
    orderId: "order-id-here"
    newStatus: CONFIRMED
  }) {
    id
    previousStatus
    newStatus
    updatedAt
    message
  }
}
```

## ✨ Benefits of New Structure

### 1. **Clear Separation of Concerns**
- ✅ DTOs separate from use cases
- ✅ Request validation in one place (Zod schemas)
- ✅ Response formatting standardized

### 2. **Type Safety with Zod**
- ✅ Runtime validation
- ✅ Type inference from schemas
- ✅ Better error messages
- ✅ Composable schemas

### 3. **Better Testability**
- ✅ Use cases are pure logic
- ✅ DTOs are simple data structures
- ✅ Easy to mock and test

### 4. **Consistent Naming**
- ✅ `UseCase` suffix for all use cases
- ✅ `RequestDto` and `ResponseDto` suffixes
- ✅ Clear intent in naming

## 🔄 Migration Guide

### Old vs New

**Old Structure:**
```
application/
├── commands/create-order/
│   ├── create-order.command.ts
│   ├── create-order.handler.ts
│   └── create-order.result.ts
└── queries/get-order/
    ├── get-order.query.ts
    └── get-order.handler.ts
```

**New Structure:**
```
application/
├── dtos/
│   ├── create-order.request.dto.ts
│   ├── order.response.dto.ts
│   ├── get-order.request.dto.ts
│   └── change-order-status.request.dto.ts
└── use-cases/
    ├── create-order/
    │   └── create-order.use-case.ts
    ├── get-order/
    │   └── get-order.use-case.ts
    └── change-order-status/
        └── change-order-status.use-case.ts
```

### Updated DI Registrations

**Before:**
```typescript
container.bind<CreateOrderHandler>(TYPES.CreateOrderHandler).to(CreateOrderHandler);
container.bind<GetOrderHandler>(TYPES.GetOrderHandler).to(GetOrderHandler);
```

**After:**
```typescript
container.bind<CreateOrderUseCase>(TYPES.CreateOrderUseCase).to(CreateOrderUseCase);
container.bind<GetOrderUseCase>(TYPES.GetOrderUseCase).to(GetOrderUseCase);
container.bind<ChangeOrderStatusUseCase>(TYPES.ChangeOrderStatusUseCase).to(ChangeOrderStatusUseCase);
```

## 📚 Files to Use

### New Files (Use These)
- ✅ `application/dtos/*.dto.ts`
- ✅ `application/use-cases/**/*.use-case.ts`
- ✅ `presentation/http/controllers/order.controller.v2.ts`
- ✅ `presentation/http/routes/order.routes.v2.ts`
- ✅ `presentation/graphql/resolvers/order.resolver.v2.ts`

### Old Files (Deprecated)
- ❌ `application/commands/**`
- ❌ `application/queries/**`
- ❌ `application/mappers/order.mapper.ts` (logic moved to use cases)
- ❌ `presentation/http/controllers/order.controller.ts` (old version)
- ❌ `presentation/http/dtos/create-order.request.ts` (moved to application layer)

## 🚀 Next Steps

1. **Install Zod:**
   ```bash
   npm install zod
   ```

2. **Update imports in server.ts:**
   ```typescript
   import { createOrderRoutes } from './modules/order/presentation/http/routes/order.routes.v2';
   import { OrderResolver } from './modules/order/presentation/graphql/resolvers/order.resolver.v2';
   ```

3. **Update DI container binding for controllers:**
   ```typescript
   import { OrderController } from './modules/order/presentation/http/controllers/order.controller.v2';
   ```

4. **Test the new endpoints**

---

**Refactored by:** Clean Architecture Team  
**Date:** January 2026  
**Status:** ✅ Complete
