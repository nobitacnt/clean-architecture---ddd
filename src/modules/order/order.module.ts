import { Container } from 'inversify';
import { TYPES} from '@/shared/common/di/types';
import { CreateOrderCommand } from '@/modules/order/application/use-cases/commands/create-order.command';
import { ChangeOrderStatusCommand } from '@/modules/order/application/use-cases/commands/change-order-status.command';
import { GetOrderQuery } from '@/modules/order/application/use-cases/queries/get-order.query';
import { OrderDomainService } from '@/modules/order/domain/services/order-domain.service';
import { OrderEventHandlersRegistrar } from './application/events/registers/order-event-handlers.register';
import { OrderMapper } from '@/modules/order/application/mappers/order.mapper';
import { ORDER_TYPES } from './order.const';
import { IOrderReadRepository } from './application/ports/repositories/order-read.repository';
import { OrderReadRepositoryImpl } from './infrastructure/repositories/order-read.repository.impl';
import { OrderWriteRepositoryImpl } from './infrastructure/repositories/order-write.repository.impl';
import { IOrderWriteRepository } from './application';

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

  // Queries (CQRS Read Side)
  container.bind<GetOrderQuery>(ORDER_TYPES.GetOrderQuery).to(GetOrderQuery);

  // Mappers
  container.bind<OrderMapper>(ORDER_TYPES.OrderMapper).to(OrderMapper);

  // Domain Services
  container.bind<OrderDomainService>(ORDER_TYPES.OrderDomainService).to(OrderDomainService);

  // Event Handlers Registrar
  const registrar = new OrderEventHandlersRegistrar(
    container.get(TYPES.InternalEventBus),
    container.get(TYPES.Logger)
  );
  registrar.register();
}
