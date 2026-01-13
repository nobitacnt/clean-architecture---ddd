import { Container } from 'inversify';
import { TYPES} from '@/common/di/types';
import { IOrderRepository } from '@/modules/order/application/ports/repositories/order.repository';
import { OrderRepositoryImpl } from '../repositories/order.repository.impl';
import { CreateOrderCommand } from '@/modules/order/application/use-cases/commands/create-order.command';
import { ChangeOrderStatusCommand } from '@/modules/order/application/use-cases/commands/change-order-status.command';
import { GetOrderQuery } from '@/modules/order/application/use-cases/queries/get-order.query';
import { OrderCreatedEventHandler } from '@/modules/order/application/event-handlers/order-created.handler';
import { OrderDomainService } from '@/modules/order/domain/services/order-domain.service';
import { OrderEventHandlersRegistrar } from '../event/register-order-event-handlers';
import { OrderMapper } from '@/modules/order/application/mappers/order.mapper';

/**
 * Load all order module dependencies into the DI container
 */
export function loadOrderModule(container: Container): void {

  // Repositories
  container.bind<IOrderRepository>(TYPES.OrderRepository).to(OrderRepositoryImpl).inSingletonScope();


  // Commands (CQRS Write Side)
  container.bind<CreateOrderCommand>(TYPES.CreateOrderCommand).to(CreateOrderCommand);
  container.bind<ChangeOrderStatusCommand>(TYPES.ChangeOrderStatusCommand).to(ChangeOrderStatusCommand);

  // Queries (CQRS Read Side)
  container.bind<GetOrderQuery>(TYPES.GetOrderQuery).to(GetOrderQuery);

  // Mappers
  container.bind<OrderMapper>(TYPES.OrderMapper).to(OrderMapper);

  // Event Handlers
  container.bind<OrderCreatedEventHandler>(TYPES.OrderCreatedEventHandler).to(OrderCreatedEventHandler);

  // Domain Services
  container.bind<OrderDomainService>(TYPES.OrderDomainService).to(OrderDomainService);

  // Event Handlers Registrar
  const registrar = new OrderEventHandlersRegistrar(
    container.get(TYPES.InternalEventBus),
    container.get(TYPES.OrderCreatedEventHandler),
    container.get(TYPES.Logger)
  );
  registrar.register();
}
