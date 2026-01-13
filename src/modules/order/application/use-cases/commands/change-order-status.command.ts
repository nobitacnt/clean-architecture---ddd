import { injectable, inject } from 'inversify';
import { TYPES } from '@/common/di/types';
import { IOrderRepository } from '../../ports/repositories/order.repository';
import { OrderDomainService } from '@/modules/order/domain/services/order-domain.service';
import { OrderStatus } from '@/modules/order/domain/value-objects/order-status.vo';
import { OrderNotFoundError } from '../../errors/order.application-error';
import { OrderMapper } from '../../mappers/order.mapper';
import {
  ChangeOrderStatusRequestDto,
  ChangeOrderStatusRequestSchema,
} from '../../dtos/change-order-status.request.dto';
import { ChangeOrderStatusResponseDto } from '../../dtos/order.response.dto';
import { ILogger } from '@/common/data/logger/logger.interface';

/**
 * Command: Change Order Status
 * Command handler for changing order status
 */
@injectable()
export class ChangeOrderStatusCommand {
  constructor(
    @inject(TYPES.OrderRepository) private readonly orderRepository: IOrderRepository,
    @inject(TYPES.OrderDomainService) private readonly orderDomainService: OrderDomainService,
    @inject(TYPES.OrderMapper) private readonly orderMapper: OrderMapper,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  /**
   * Execute change order status command
   * @param request - ChangeOrderStatusRequestDto (validated with Zod)
   * @returns ChangeOrderStatusResponseDto
   */
  async execute(request: ChangeOrderStatusRequestDto): Promise<ChangeOrderStatusResponseDto> {
    // Validate request with Zod
    const validatedRequest = ChangeOrderStatusRequestSchema.parse(request);

    // Load order aggregate
    const order = await this.orderRepository.findById(validatedRequest.orderId);

    if (!order) {
      this.logger.warn('Order not found for status change', { orderId: validatedRequest.orderId });
      throw new OrderNotFoundError(validatedRequest.orderId);
    }

    const previousStatus = order.status.toString();
    const newStatus = OrderStatus.fromString(validatedRequest.newStatus);

    // Special handling for cancellation
    if (validatedRequest.newStatus === 'CANCELLED') {
      this.orderDomainService.cancelOrder(order);
    } else {
      // Regular status change
      order.changeStatus(newStatus);
    }

    await this.orderRepository.save(order);

    // Return response DTO using mapper
    return this.orderMapper.toChangeOrderStatusResponseDto(order, previousStatus);
  }
}
