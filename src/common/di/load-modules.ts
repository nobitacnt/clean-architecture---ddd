import { Container } from 'inversify';
import { TYPES } from './types';
import { SimpleLogger } from '../data/logger/providers/simple-logger';
import { InternalEventBus } from '../data/event-bus/internal-event-bus.interface';
import { InMemoryEventBus } from '../data/event-bus/providers/in-memory-event-bus';
import { DomainEventsDispatcher } from '../event/domain-events.dispatcher';
import { IDBClient } from '../data/database/db-client.interface';
import { PrismaDBClient } from '../data/database/providers/prisma.db-client';
import { ILogger } from '../data/logger/logger.interface';

/**
 * Load all common dependencies into the container
 */
export function loadCommonModules(container: Container): void {
  // Logger
  container.bind<ILogger>(TYPES.Logger).to(SimpleLogger).inSingletonScope();
  
  // Event Bus
  container.bind<InternalEventBus>(TYPES.InternalEventBus).to(InMemoryEventBus).inSingletonScope();
  
  // Domain Events Dispatcher
  container.bind<DomainEventsDispatcher>(TYPES.DomainEventsDispatcher).to(DomainEventsDispatcher).inSingletonScope();

   // Domain Events Dispatcher
  container.bind<IDBClient>(TYPES.IDBClient).to(PrismaDBClient).inSingletonScope();
}
