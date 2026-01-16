import { DomainEvent } from '@/shared/domain/events/domain-event';
import { CUSTOMER_EVENTS } from './event.const';

export class CustomerCreatedEvent extends DomainEvent {
  constructor(
    public readonly customerId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly creditLimit: number
  ) {
    super(customerId);
  }

  getEventName(): string {
    return CUSTOMER_EVENTS.CUSTOMER_CREATED;
  }
}
