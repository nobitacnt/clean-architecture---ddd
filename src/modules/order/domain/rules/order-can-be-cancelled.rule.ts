import { OrderAggregate } from '../aggregates/order.aggregate';
import { OrderCannotBeCancelledException } from '../exceptions/order.domain-exception';

/**
 * Business rule: Check if an order can be cancelled
 */
export class OrderCanBeCancelledRule {
  /**
   * Check if the order can be cancelled
   */
  static isSatisfiedBy(order: OrderAggregate): boolean {
    // Cannot cancel if already delivered
    if (order.status.isDelivered()) {
      return false;
    }

    // Cannot cancel if already cancelled
    if (order.status.isCancelled()) {
      return false;
    }

    return true;
  }

  /**
   * Check and throw exception if rule is not satisfied
   */
  static checkOrThrow(order: OrderAggregate): void {
    if (!this.isSatisfiedBy(order)) {
      if (order.status.isDelivered()) {
        throw new OrderCannotBeCancelledException(
          'Order has already been delivered'
        );
      }
      if (order.status.isCancelled()) {
        throw new OrderCannotBeCancelledException(
          'Order is already cancelled'
        );
      }
      throw new OrderCannotBeCancelledException('Unknown reason');
    }
  }
}
