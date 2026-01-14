import { DomainEvent } from '@/shared/domain/events/domain-event';

/**
 * Handler function for domain events
 */
export type DomainEventHandler<T extends DomainEvent = DomainEvent> = (
  event: T
) => Promise<void> | void;

/**
 * Internal event bus interface for publishing and subscribing to domain events
 */
export interface IEventBus {
  /**
   * Publish a domain event to all subscribers
   */
  publish(event: DomainEvent): Promise<void>;

  /**
   * Subscribe to a specific domain event type
   */
  subscribe(eventName: string, handler: DomainEventHandler): void;

  /**
   * Unsubscribe from a specific domain event type
   */
  unsubscribe(eventName: string, handler: DomainEventHandler): void;
}
