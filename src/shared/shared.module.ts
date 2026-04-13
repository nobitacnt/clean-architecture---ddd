import { Container } from 'inversify';

import { IDBClientManager } from './application/ports/database/db-client-manager.interface';
import { IEventBus } from './application/ports/event-bus/event-bus.interface';
import { IEventDispatcher } from './application/ports/event-dispatcher/event-dispatcher.interface';
import { ILogger } from './application/ports/logger/logger.interface';
import { TYPES } from './common/di/types';
import { PrismaClientManager } from './infrastructure/database/prisma-client-manager';
import { InMemoryEventBus } from './infrastructure/event-bus/in-memory-event-bus';
import { DomainEventDispatcher } from './infrastructure/event-dispatcher/domain-event-dispatcher';
import { SimpleLogger } from './infrastructure/logger/simple-logger';

/**
 * Load all common dependencies into the container
 */
export function loadSharedModules(container: Container): void {
  // Logger
  container.bind<ILogger>(TYPES.Logger).to(SimpleLogger).inSingletonScope();

  // Event Bus
  container.bind<IEventBus>(TYPES.InternalEventBus).to(InMemoryEventBus).inSingletonScope();

  // Domain Events Dispatcher
  container
    .bind<IEventDispatcher>(TYPES.DomainEventsDispatcher)
    .to(DomainEventDispatcher)
    .inSingletonScope();

  // Domain Events Dispatcher
  container
    .bind<IDBClientManager>(TYPES.DBClientManager)
    .to(PrismaClientManager)
    .inSingletonScope();
}
