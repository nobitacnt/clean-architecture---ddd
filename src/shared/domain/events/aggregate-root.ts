import { DomainEvent } from './domain-event';

/**
 * Base class for all aggregate roots
 * Manages domain events for the aggregate
 */
export abstract class AggregateRoot {
  private domainEvents: DomainEvent[] = [];

  /**
   * Get all uncommitted domain events
   */
  public getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  /**
   * Add a domain event to the aggregate
   */
  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  /**
   * Clear all domain events after they have been dispatched
   */
  public clearDomainEvents(): void {
    this.domainEvents = [];
  }

  /**
   * Get the aggregate ID
   */
  abstract getId(): string;
}
