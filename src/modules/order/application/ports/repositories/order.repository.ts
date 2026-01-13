import { OrderAggregate } from '@/modules/order/domain/aggregates/order.aggregate';

/**
 * Repository interface for Order aggregate
 * This is a port in the hexagonal architecture
 */
export interface IOrderRepository {
  /**
   * Save a new order or update an existing one
   */
  save(order: OrderAggregate): Promise<void>;

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

  /**
   * Delete an order
   */
  delete(orderId: string): Promise<void>;
}
