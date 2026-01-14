import { DomainEvent } from '@/shared/domain/events/domain-event';
import { OrderItem } from '../entities/order.entity';

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
    return 'OrderCreated';
  }
}
