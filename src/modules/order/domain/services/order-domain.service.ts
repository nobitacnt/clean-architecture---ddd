import { injectable } from 'inversify';
import { OrderAggregate } from '../aggregates/order.aggregate';
import { OrderCanBeCancelledRule } from '../rules/order-can-be-cancelled.rule';

/**
 * Domain service for order-related operations
 * Contains business logic that doesn't naturally fit within a single aggregate
 */
@injectable()
export class OrderDomainService {
  /**
   * Cancel an order with business rule validation
   */
  cancelOrder(order: OrderAggregate): void {
    // Apply business rules
    OrderCanBeCancelledRule.checkOrThrow(order);

    // Perform the cancellation
    order.cancel();
  }

  /**
   * Check if an order can be cancelled
   */
  canCancelOrder(order: OrderAggregate): boolean {
    return OrderCanBeCancelledRule.isSatisfiedBy(order);
  }
}
