import { v4 as uuidv4 } from 'uuid';

/**
 * Base class for all domain events
 */
export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly aggregateId: string;

  constructor(aggregateId: string) {
    this.eventId = uuidv4();
    this.occurredOn = new Date();
    this.aggregateId = aggregateId;
  }

  /**
   * Get the event name for identification
   */
  abstract getEventName(): string;
}
