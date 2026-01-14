import { Container } from 'inversify';
import { TYPES } from './types';
import { ILogger } from '@/shared/application/ports/logger/logger.interface';
import { SimpleLogger } from '@/shared/infrastructure/logger/simple-logger';
import { IEventBus } from '@/shared/application/ports/event-bus/event-bus.interface';
import { InMemoryEventBus } from '@/shared/infrastructure/event-bus/in-memory-event-bus';
import { IEventDispatcher } from '@/shared/application/ports/event-dispatcher/event-dispatcher.interface';
import { DomainEventDispatcher } from '@/shared/infrastructure/event-dispatcher/domain-event-dispatcher';
import { PrismaClientManager } from '@/shared/infrastructure/database/prisma-client-manager';
import { IDBClientManager } from '@/shared/application/ports/database/db-client-manager.interface';

/**
 * Load all common dependencies into the container
 */
export function loadCommonModules(container: Container): void {
  // Logger
  container.bind<ILogger>(TYPES.Logger).to(SimpleLogger).inSingletonScope();
  
  // Event Bus
  container.bind<IEventBus>(TYPES.InternalEventBus).to(InMemoryEventBus).inSingletonScope();
  
  // Domain Events Dispatcher
  container.bind<IEventDispatcher>(TYPES.DomainEventsDispatcher).to(DomainEventDispatcher).inSingletonScope();

   // Domain Events Dispatcher
  container.bind<IDBClientManager>(TYPES.DBClientManager).to(PrismaClientManager).inSingletonScope();
}
