import { Resolver, Query, Mutation, Arg, ID, Int } from 'type-graphql';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/common/di/types';
import { CreateOrderCommand } from '@/modules/order/application/use-cases/commands/create-order.command';
import { GetOrderQuery } from '@/modules/order/application/use-cases/queries/get-order.query';
import { ChangeOrderStatusCommand } from '@/modules/order/application/use-cases/commands/change-order-status.command';
import { CreateOrderInput } from '../inputs/create-order.input';
import { ChangeOrderStatusInput } from '../inputs/change-order-status.input';
import { OrderType, CreateOrderResultType, ChangeOrderStatusResultType } from '../schemas/order.schema';
import { ILogger } from '@/shared/application/ports/logger/logger.interface';
import { ORDER_TYPES } from '@/modules/order/order.const';

/**
 * GraphQL resolver for Order
 */
@injectable()
@Resolver(() => OrderType)
export class OrderResolver {
  constructor(
    @inject(ORDER_TYPES.CreateOrderCommand) private readonly createOrderUseCase: CreateOrderCommand,
    @inject(ORDER_TYPES.GetOrderQuery) private readonly getOrderUseCase: GetOrderQuery,
    @inject(ORDER_TYPES.ChangeOrderStatusCommand) private readonly changeOrderStatusUseCase: ChangeOrderStatusCommand,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  /**
   * Query to get an order by ID
   */
  @Query(() => OrderType, { nullable: true })
  async order(@Arg('id', () => ID) id: string): Promise<OrderType | null> {
    try {
      const result = await this.getOrderUseCase.execute({ orderId: id });
      return result as OrderType;
    } catch (error) {
      this.logger.error('Error getting order', error);
      throw error;
    }
  }

  /**
   * Query to get all orders
   */
  @Query(() => [OrderType])
  async orders(
    @Arg('page', () => Int, { defaultValue: 1 }) page: number,
    @Arg('limit', () => Int, { defaultValue: 10 }) limit: number
  ): Promise<OrderType[]> {
    try {
      const result = await this.getOrderUseCase.executeList({ page, limit });
      return result.data as OrderType[];
    } catch (error) {
      this.logger.error('Error getting orders', error);
      throw error;
    }
  }

  /**
   * Mutation to create a new order
   */
  @Mutation(() => CreateOrderResultType)
  async createOrder(@Arg('input') input: CreateOrderInput): Promise<CreateOrderResultType> {
    try {
      const result = await this.createOrderUseCase.execute({
        customerId: input.customerId,
        items: input.items,
      });
      return result as CreateOrderResultType;
    } catch (error) {
      this.logger.error('Error creating order', error);
      throw error;
    }
  }

  /**
   * Mutation to change order status
   */
  @Mutation(() => ChangeOrderStatusResultType)
  async changeOrderStatus(@Arg('input') input: ChangeOrderStatusInput): Promise<ChangeOrderStatusResultType> {
    try {
      const result = await this.changeOrderStatusUseCase.execute({
        orderId: input.orderId,
        newStatus: input.newStatus,
      });
      return result as ChangeOrderStatusResultType;
    } catch (error) {
      this.logger.error('Error changing order status', error);
      throw error;
    }
  }
}
