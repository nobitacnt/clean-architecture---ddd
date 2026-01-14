import { injectable, inject } from 'inversify';
import { AggregateRoot } from '@/shared/domain/events/aggregate-root';
import { TYPES } from '@/shared/common/di/types';
import { ILogger } from '@/shared/application/ports/logger/logger.interface';
import { IEventBus } from '@/shared/application/ports/event-bus/event-bus.interface';
import { IEventDispatcher } from '@/shared/application/ports/event-dispatcher/event-dispatcher.interface';

/**
 * Dispatcher for domain events from aggregate roots
 */
@injectable()
export class DomainEventDispatcher implements IEventDispatcher {
  constructor(
    @inject(TYPES.InternalEventBus) private readonly eventBus: IEventBus,
    @inject(TYPES.Logger) private readonly logger: ILogger
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
