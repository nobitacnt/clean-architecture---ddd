import { OrderAggregate } from '@/modules/order/domain/aggregates/order.aggregate';

/**
 * Repository interface for Order aggregate
 * This is a port in the hexagonal architecture
 */
export interface IOrderReadRepository {

  /**
   * Find an order by ID
   */
  findById(orderId: string): Promise<OrderAggregate | null>;

  /**
   * Find all orders
   */
  findAll(page?: number, limit?: number): Promise<OrderAggregate[]>;

  /**
   * Find orders by customer ID
   */
  findByCustomerId(customerId: string): Promise<OrderAggregate[]>;
}
