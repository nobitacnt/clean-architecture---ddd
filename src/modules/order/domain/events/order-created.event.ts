import { DomainEvent } from '@/shared/domain/events/domain-event';
import { OrderItem } from '../entities/order.entity';
import { ORDER_EVENTS } from './event.const';

/**
 * Domain event raised when an order is created
 */
export class OrderCreatedEvent extends DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: number
  ) {
    super(orderId);
  }

  getEventName(): string {
    return ORDER_EVENTS.OrderCreated;
  }
}
