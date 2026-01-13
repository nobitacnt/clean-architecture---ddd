import { injectable, inject } from 'inversify';
import { OrderItem as OrderItemModel } from '@prisma/client';
import { TYPES } from '@/common/di/types';
import { IOrderRepository } from '@/modules/order/application/ports/repositories/order.repository';
import { OrderAggregate } from '@/modules/order/domain/aggregates/order.aggregate';
import { OrderEntity, OrderItem } from '@/modules/order/domain/entities/order.entity';
import { OrderId } from '@/modules/order/domain/value-objects/order-id.vo';
import { OrderStatus } from '@/modules/order/domain/value-objects/order-status.vo';
import { OrderWithItems } from '../models/order.model';
import { IDBClient } from '@/common/data/database/db-client.interface';

/**
 * Prisma implementation of Order Repository
 */
@injectable()
export class OrderRepositoryImpl implements IOrderRepository {
  constructor(
    @inject(TYPES.IDBClient) private readonly dbClient: IDBClient
  ) {

  }

  /**
   * save or update an order
   * @param order 
   * @returns 
   */
  async save(order: OrderAggregate): Promise<void> {
    const orderId = order.id.toString();

    const dbClient = await this.dbClient.getClient();

    // Check if order exists
    const existingOrder = await dbClient.order.findUnique({
      where: { id: orderId },
    });

    if (existingOrder) {
      // Update existing order
      this.update(orderId, order);
      return;
    } 

    // Create new order with items
    this.create(orderId, order);
  }

  /**
   * update an existing order
   * @param orderId 
   * @param order 
   */
  private async update(orderId: string, order: OrderAggregate): Promise<void> {
    const dbClient = await this.dbClient.getClient();
    await dbClient.order.update({
        where: { id: orderId },
        data: {
          customerId: order.customerId,
          totalAmount: order.totalAmount,
          status: order.status.toString(),
          updatedAt: order.updatedAt,
        },
    });
  }

  /**
   * create a new order
   * @param orderId 
   * @param order 
   */
  private async create(orderId: string, order: OrderAggregate): Promise<void> {
    const dbClient = await this.dbClient.getClient();
    await dbClient.order.create({
      data: {
          id: orderId,
          customerId: order.customerId,
          totalAmount: order.totalAmount,
          status: order.status.toString(),
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: {
          create: order.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
          })),
          },
      },
    });
  }

  /**
   * find an order by ID
   * @param orderId 
   * @returns 
   */
  async findById(orderId: string): Promise<OrderAggregate | null> {
    const dbClient = await this.dbClient.getClient();
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
    const dbClient = await this.dbClient.getClient();
    const skip = (page - 1) * limit;

    const orders = await dbClient.order.findMany({
      skip,
      take: limit,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order: OrderWithItems) => this.toDomain(order));
  }

  /**
   * find orders by customer ID
   * @param customerId 
   * @returns 
   */
  async findByCustomerId(customerId: string): Promise<OrderAggregate[]> {
    const dbClient = await this.dbClient.getClient();
    const orders = await dbClient.order.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order: OrderWithItems) => this.toDomain(order));
  }

  /**
   * delete an order by ID
   * @param orderId 
   */
  async delete(orderId: string): Promise<void> {
    const dbClient = await this.dbClient.getClient();
    await dbClient.order.delete({
      where: { id: orderId },
    });
  }

  /**
   * Convert from Prisma model to domain aggregate
   */
  private toDomain(orderData: OrderWithItems): OrderAggregate {
    const items: OrderItem[] = orderData.items.map((item: OrderItemModel) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
    }));

    const entity = OrderEntity.fromPersistence({
      id: OrderId.fromString(orderData.id),
      customerId: orderData.customerId,
      items,
      totalAmount: orderData.totalAmount,
      status: OrderStatus.fromString(orderData.status),
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt,
    });

    return OrderAggregate.fromEntity(entity);
  }
}
