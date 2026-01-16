import { AggregateRoot } from '@/shared/domain/events/aggregate-root';
import { OrderEntity, OrderItem } from '../entities/order.entity';
import { OrderId } from '../value-objects/order-id.vo';
import { OrderStatus } from '../value-objects/order-status.vo';
import { OrderCreatedEvent } from '../events/order-created.event';
import { OrderStatusChangedEvent } from '../events/order-status-changed.event';
import {
  InvalidOrderStatusTransitionException,
  OrderAlreadyCancelledException,
} from '../exceptions/order.domain-exception';
import { OrderCanBeCancelledRule } from '../rules/order-can-be-cancelled.rule';

/**
 * Order Aggregate Root
 * Encapsulates business logic and raises domain events
 */
export class OrderAggregate extends AggregateRoot {
  private order: OrderEntity;

  private constructor(order: OrderEntity) {
    super();
    this.order = order;
  }

  /**
   * Create a new order
   */
  static create(customerId: string, items: OrderItem[]): OrderAggregate {
    const order = OrderEntity.create(customerId, items);
    const aggregate = new OrderAggregate(order);

    // Raise domain event
    aggregate.addDomainEvent(
      new OrderCreatedEvent(
        order.id.toString(),
        order.customerId,
        order.items,
        order.totalAmount
      )
    );

    return aggregate;
  }

  /**
   * Reconstitute from persistence
   */
  static fromEntity(order: OrderEntity): OrderAggregate {
    return new OrderAggregate(order);
  }

  /**
   * Change the order status
   */
  changeStatus(newStatus: OrderStatus): void {
    // Special handling for cancellation - apply cancellation business rules
    if (newStatus.isCancelled()) {
      OrderCanBeCancelledRule.checkOrThrow(this);
    }

    // Business rule: cannot modify cancelled orders
    if (this.order.status.isCancelled()) {
      throw new OrderAlreadyCancelledException();
    }

    // Business rule: check valid status transition
    if (!this.order.status.canTransitionTo(newStatus)) {
      throw new InvalidOrderStatusTransitionException(
        this.order.status.toString(),
        newStatus.toString()
      );
    }

    const previousStatus = this.order.status.toString();
    this.order.updateStatus(newStatus);

    // Raise domain event
    this.addDomainEvent(
      new OrderStatusChangedEvent(
        this.order.id.toString(),
        previousStatus,
        newStatus.toString(),
        new Date()
      )
    );
  }

  /**
   * Cancel the order
   * Applies business rule validation before cancellation
   */
  cancel(): void {
    // Apply business rule: check if order can be cancelled
    OrderCanBeCancelledRule.checkOrThrow(this);
    
    const cancelledStatus = OrderStatus.fromString('CANCELLED');
    this.changeStatus(cancelledStatus);
  }

  /**
   * Check if this order can be cancelled
   */
  canBeCancelled(): boolean {
    return OrderCanBeCancelledRule.isSatisfiedBy(this);
  }

  /**
   * Confirm the order
   */
  confirm(): void {
    const confirmedStatus = OrderStatus.fromString('CONFIRMED');
    this.changeStatus(confirmedStatus);
  }

  /**
   * Get the order entity
   */
  getOrder(): OrderEntity {
    return this.order;
  }

  /**
   * Get aggregate ID
   */
  getId(): string {
    return this.order.id.toString();
  }

  // Expose entity properties through aggregate
  get id(): OrderId {
    return this.order.id;
  }

  get customerId(): string {
    return this.order.customerId;
  }

  get items(): OrderItem[] {
    return this.order.items;
  }

  get totalAmount(): number {
    return this.order.totalAmount;
  }

  get status(): OrderStatus {
    return this.order.status;
  }

  get createdAt(): Date {
    return this.order.createdAt;
  }

  get updatedAt(): Date {
    return this.order.updatedAt;
  }
}
