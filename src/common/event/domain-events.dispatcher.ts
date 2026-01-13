import { injectable, inject } from 'inversify';
import { AggregateRoot } from './aggregate-root';
import { InternalEventBus } from '../data/event-bus/internal-event-bus.interface';
import { Logger } from '../data/logger/providers/simple-logger';
import { TYPES } from '../di/types';

/**
 * Dispatcher for domain events from aggregate roots
 */
@injectable()
export class DomainEventsDispatcher {
  constructor(
    @inject(TYPES.InternalEventBus) private readonly eventBus: InternalEventBus,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  /**
   * Dispatch all domain events from an aggregate root
   */
  async dispatchEventsForAggregate(aggregate: AggregateRoot): Promise<void> {
    const events = aggregate.getDomainEvents();
    
    if (events.length === 0) {
      return;
    }

    this.logger.info(`Dispatching ${events.length} domain events for aggregate: ${aggregate.getId()}`);

    for (const event of events) {
      await this.eventBus.publish(event);
    }

    aggregate.clearDomainEvents();
  }

  /**
   * Dispatch events from multiple aggregates
   */
  async dispatchEventsForAggregates(aggregates: AggregateRoot[]): Promise<void> {
    for (const aggregate of aggregates) {
      await this.dispatchEventsForAggregate(aggregate);
    }
  }
}
