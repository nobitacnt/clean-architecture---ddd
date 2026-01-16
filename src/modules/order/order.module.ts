import { Container } from 'inversify';
import { TYPES} from '@/shared/common/di/types';
import { CreateOrderCommand } from '@/modules/order/application/use-cases/commands/create-order.command';
import { ChangeOrderStatusCommand } from '@/modules/order/application/use-cases/commands/change-order-status.command';
import { GetOrderQuery } from '@/modules/order/application/use-cases/queries/get-order.query';
import { OrderEventHandlersRegistrar } from './application/events/registers/order-event-handlers.register';
import { OrderMapper } from '@/modules/order/application/mappers/order.mapper';
import { ORDER_TYPES } from './order.const';
import { IOrderReadRepository } from './application/ports/repositories/order-read.repository';
import { OrderReadRepositoryImpl } from './infrastructure/repositories/order-read.repository.impl';
import { OrderWriteRepositoryImpl } from './infrastructure/repositories/order-write.repository.impl';
import { IOrderWriteRepository, OrderCreatedEventHandler } from './application';
import { OrderStatusChangedEventHandler } from './application/events/handlers/order-status-changed.handler';
import { OrderResolver } from './presentation/graphql/resolvers/order.resolver';
import { OrderController } from './presentation/http/controllers/order.controller';

/**
 * Load all order module dependencies into the DI container
 */
export function loadOrderModule(container: Container): void {

  // Repositories
  container.bind<IOrderReadRepository>(ORDER_TYPES.OrderReadRepository).to(OrderReadRepositoryImpl).inSingletonScope();
  container.bind<IOrderWriteRepository>(ORDER_TYPES.OrderWriteRepository).to(OrderWriteRepositoryImpl).inSingletonScope();


  // Commands (CQRS Write Side)
  container.bind<CreateOrderCommand>(ORDER_TYPES.CreateOrderCommand).to(CreateOrderCommand);
  container.bind<ChangeOrderStatusCommand>(ORDER_TYPES.ChangeOrderStatusCommand).to(ChangeOrderStatusCommand);

  // Event Handlers are registered in OrderEventHandlersRegistrar below
  container.bind<OrderCreatedEventHandler>(ORDER_TYPES.OrderCreatedEventHandler).to(OrderCreatedEventHandler);
  container.bind<OrderStatusChangedEventHandler>(ORDER_TYPES.OrderStatusChangedEventHandler).to(OrderStatusChangedEventHandler);

  // Queries (CQRS Read Side)
  container.bind<GetOrderQuery>(ORDER_TYPES.GetOrderQuery).to(GetOrderQuery);

  // Mappers
  container.bind<OrderMapper>(ORDER_TYPES.OrderMapper).to(OrderMapper);

  // Presentation Layer - Bind by class for TypeGraphQL and direct access
  container.bind<OrderController>(ORDER_TYPES.OrderController).to(OrderController);
  container.bind<OrderResolver>(OrderResolver).to(OrderResolver);

  // Event Handlers Registrar
  const registrar = new OrderEventHandlersRegistrar(
    container.get(TYPES.InternalEventBus),
    container.get<OrderCreatedEventHandler>(ORDER_TYPES.OrderCreatedEventHandler),
    container.get<OrderStatusChangedEventHandler>(ORDER_TYPES.OrderStatusChangedEventHandler),
    container.get(TYPES.Logger)
  );
  registrar.register();
}
