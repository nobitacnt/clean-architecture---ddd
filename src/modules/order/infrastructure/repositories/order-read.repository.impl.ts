import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/common/di/types';
import { OrderAggregate } from '@/modules/order/domain/aggregates/order.aggregate';
import { OrderEntity, OrderItem } from '@/modules/order/domain/entities/order.entity';
import { OrderId } from '@/modules/order/domain/value-objects/order-id.vo';
import { OrderStatus } from '@/modules/order/domain/value-objects/order-status.vo';
import { OrderModel, OrderItemModel } from '../models/order.model';
import { IOrderReadRepository } from '../../application/ports/repositories/order-read.repository';
import { PrismaClientManager } from '@/shared/infrastructure/database/prisma-client-manager';
import { DatabaseRole } from '@/shared/common/const';

/**
 * Prisma implementation of Order Repository
 */
@injectable()
export class OrderReadRepositoryImpl implements IOrderReadRepository {
  constructor(
    @inject(TYPES.DBClientManager) private readonly dbClientManager: PrismaClientManager
  ) {
  }

  /**
   * get read-only database client
   * @returns PrismaClient
   */
  private async getDbClient() {
    return await this.dbClientManager.getClient(DatabaseRole.READ);
  }

  /**
   * find an order by ID
   * @param orderId 
   * @returns 
   */
  async findById(orderId: string): Promise<OrderAggregate | null> {
    const dbClient = await this.getDbClient();
    const orderData = await dbClient.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!orderData) {
      return null;
    }

    return this.toDomain(orderData);
  }

  /**
   * find all orders with pagination
   * @param page 
   * @param limit 
   * @returns 
   */
  async findAll(page: number = 1, limit: number = 10): Promise<OrderAggregate[]> {
    const dbClient = await this.getDbClient();
    const skip = (page - 1) * limit;

    const orders = await dbClient.order.findMany({
      skip,
      take: limit,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order: OrderModel) => this.toDomain(order));
  }

  /**
   * find orders by customer ID
   * @param customerId 
   * @returns 
   */
  async findByCustomerId(customerId: string): Promise<OrderAggregate[]> {
    const dbClient = await this.getDbClient();
    const orders = await dbClient.order.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order: OrderModel) => this.toDomain(order));
  }


  /**
   * Convert from Prisma model to domain aggregate
   */
  private toDomain(orderModel: OrderModel): OrderAggregate {
    const items: OrderItem[] = orderModel.items.map((item: OrderItemModel) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
    }));

    const entity = OrderEntity.fromPersistence({
      id: OrderId.fromString(orderModel.id),
      customerId: orderModel.customerId,
      items,
      totalAmount: orderModel.totalAmount,
      status: OrderStatus.fromString(orderModel.status),
      createdAt: orderModel.createdAt,
      updatedAt: orderModel.updatedAt,
    });

    return OrderAggregate.fromEntity(entity);
  }
}
