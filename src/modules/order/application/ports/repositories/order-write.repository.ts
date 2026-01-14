import { OrderAggregate } from '@/modules/order/domain/aggregates/order.aggregate';

/**
 * Repository interface for Order aggregate
 * This is a port in the hexagonal architecture
 */
export interface IOrderWriteRepository {
  /**
   * Save a new order or update an existing one
   */
  save(order: OrderAggregate): Promise<void>;

  /**
   * Delete an order
   */
  delete(orderId: string): Promise<void>;
}
