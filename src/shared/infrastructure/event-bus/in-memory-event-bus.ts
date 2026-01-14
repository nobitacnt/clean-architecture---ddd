import { injectable, inject } from 'inversify';
import { DomainEvent } from '@/shared/domain/events/domain-event';
import { TYPES } from '@/shared/common/di/types';
import { ILogger } from '@/shared/application/ports/logger/logger.interface';
import { DomainEventHandler, IEventBus } from '@/shared/application/ports/event-bus/event-bus.interface';

/**
 * In-memory implementation of the event bus
 * Handles event publishing and subscription in the same process
 */
@injectable()
export class InMemoryEventBus implements IEventBus {
  private handlers: Map<string, Set<DomainEventHandler>> = new Map();

  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    const eventName = event.getEventName();
    this.logger.info(`Publishing event: ${eventName}`, { eventId: event.eventId });

    const handlers = this.handlers.get(eventName);
    
    if (!handlers || handlers.size === 0) {
      this.logger.warn(`No handlers registered for event: ${eventName}`);
      return;
    }

    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(event);
        this.logger.debug(`Handler executed successfully for event: ${eventName}`);
      } catch (error) {
        this.logger.error(`Error executing handler for event: ${eventName}`, error);
        throw error;
      }
    });

    await Promise.all(promises);
  }

  subscribe(eventName: string, handler: DomainEventHandler): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    
    this.handlers.get(eventName)!.add(handler);
    this.logger.debug(`Subscribed handler to event: ${eventName}`);
  }

  unsubscribe(eventName: string, handler: DomainEventHandler): void {
    const handlers = this.handlers.get(eventName);
    
    if (handlers) {
      handlers.delete(handler);
      this.logger.debug(`Unsubscribed handler from event: ${eventName}`);
    }
  }
}
