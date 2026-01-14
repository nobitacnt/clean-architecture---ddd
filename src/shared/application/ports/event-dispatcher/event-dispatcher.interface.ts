
import { AggregateRoot } from '@/shared/domain/events/aggregate-root';
/**
 * Dispatcher for domain events from aggregate roots
 */
export interface IEventDispatcher {

  /**
   * Dispatch all domain events from an aggregate root
   */
   dispatchEventsForAggregate(aggregate: AggregateRoot): Promise<void> 

  /**
   * Dispatch events from multiple aggregates
   */
   dispatchEventsForAggregates(aggregates: AggregateRoot[]): Promise<void> 
}
