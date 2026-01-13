import { injectable, inject } from 'inversify';
import { TYPES } from '@/common/di/types';
import { IOrderRepository } from '../../ports/repositories/order.repository';
import { OrderAggregate } from '@/modules/order/domain/aggregates/order.aggregate';
import { OrderCreationFailedError } from '../../errors/order.application-error';
import {
  CreateOrderRequestDto,
  CreateOrderRequestSchema,
} from '../../dtos/create-order.request.dto';
import { CreateOrderResponseDto } from '../../dtos/order.response.dto';
import { OrderMapper } from '../../mappers/order.mapper';
import { ILogger } from '@/common/data/logger/logger.interface';

/**
 * Command: Create Order
 * Command handler for creating a new order with validation
 */
@injectable()
export class CreateOrderCommand {
  constructor(
    @inject(TYPES.OrderRepository) private readonly orderRepository: IOrderRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  /**
   * Execute the create order use case
   * @param request - CreateOrderRequestDto (validated with Zod)
   * @returns CreateOrderResponseDto
   */
  async execute(request: CreateOrderRequestDto): Promise<CreateOrderResponseDto> {
    // Validate request with Zod
    const validatedRequest = CreateOrderRequestSchema.parse(request);

    try {
      // Create the order aggregate
      const orderAggregate = OrderAggregate.create(
        validatedRequest.customerId,
        validatedRequest.items
      );

      // Save within a transaction and dispatch events
      await this.orderRepository.save(orderAggregate);

      this.logger.info('Order created successfully', {
        orderId: orderAggregate.id.toString(),
      });

      // Return response DTO
      return OrderMapper.toCreateOrderResponse(orderAggregate);
    } catch (error) {
      this.logger.error('Failed to create order', error);
      throw new OrderCreationFailedError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}
