import { Container } from 'inversify';
import { TYPES } from '@/shared/common/di/types';
import { CUSTOMER_TYPES } from './customer.const';
import { CreateCustomerCommand } from './application/use-cases/commands/create-customer.command';
import { CustomerMapper } from './application/mappers/customer.mapper';
import { ICustomerReadRepository } from './application/ports/repositories/customer-read.repository';
import { ICustomerWriteRepository } from './application/ports/repositories/customer-write.repository';
import { CustomerReadRepositoryImpl } from './infrastructure/repositories/customer-read.repository.impl';
import { CustomerWriteRepositoryImpl } from './infrastructure/repositories/customer-write.repository.impl';
import { CustomerCreatedEventHandler } from './application/events/handlers/customer-created.handler';
import { CustomerEventHandlersRegistrar } from './application/events/registers/customer-event-handlers.register';
import { CustomerController } from './presentation/http/controllers/customer.controller';

export function loadCustomerModule(container: Container): void {
  container.bind<ICustomerReadRepository>(CUSTOMER_TYPES.CustomerReadRepository).to(CustomerReadRepositoryImpl).inSingletonScope();
  container.bind<ICustomerWriteRepository>(CUSTOMER_TYPES.CustomerWriteRepository).to(CustomerWriteRepositoryImpl).inSingletonScope();

  container.bind<CreateCustomerCommand>(CUSTOMER_TYPES.CreateCustomerCommand).to(CreateCustomerCommand);

  container.bind<CustomerCreatedEventHandler>(CUSTOMER_TYPES.CustomerCreatedEventHandler).to(CustomerCreatedEventHandler);

  container.bind<CustomerMapper>(CUSTOMER_TYPES.CustomerMapper).to(CustomerMapper).inSingletonScope();

  container.bind<CustomerController>(CUSTOMER_TYPES.CustomerController).to(CustomerController);

  const registrar = new CustomerEventHandlersRegistrar(
    container.get(TYPES.InternalEventBus),
    container.get<CustomerCreatedEventHandler>(CUSTOMER_TYPES.CustomerCreatedEventHandler),
    container.get(TYPES.Logger)
  );
  registrar.register();
}
