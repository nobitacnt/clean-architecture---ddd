import { DomainEvent } from '@/common/event/domain-event';

/**
 * Domain event raised when an order status changes
 */
export class OrderStatusChangedEvent extends DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
    public readonly changedAt: Date
  ) {
    super(orderId);
  }

  getEventName(): string {
    return 'OrderStatusChanged';
  }
}
