import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/common/di/types';
import { IOrderWriteRepository } from '@/modules/order/application/ports/repositories/order-write.repository';
import { OrderAggregate } from '@/modules/order/domain/aggregates/order.aggregate';
import { DatabaseRole } from '@/shared/common/const';
import { PrismaClientManager } from '@/shared/infrastructure/database/prisma-client-manager';

/**
 * Prisma implementation of Order Repository
 */
@injectable()
export class OrderWriteRepositoryImpl implements IOrderWriteRepository {
  constructor(
    @inject(TYPES.DBClientManager) private readonly dbClientManager: PrismaClientManager
  ) {
  }

  /**
   * get read-only database client
   * @returns PrismaClient
   */
  private async getDbClient() {
    return await this.dbClientManager.getClient(DatabaseRole.WRITE);
  }


  /**
   * save or update an order
   * @param order 
   * @returns 
   */
  async save(order: OrderAggregate): Promise<void> {
    const orderId = order.id.toString();

    const dbClient = await this.getDbClient();

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
    const dbClient = await this.getDbClient();
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
    const dbClient = await this.getDbClient();
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
   * delete an order by ID
   * @param orderId 
   */
  async delete(orderId: string): Promise<void> {
    const dbClient = await this.getDbClient();
    await dbClient.order.delete({
      where: { id: orderId },
    });
  }
}
