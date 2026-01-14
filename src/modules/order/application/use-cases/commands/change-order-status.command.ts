import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/common/di/types';
import { OrderDomainService } from '@/modules/order/domain/services/order-domain.service';
import { OrderStatus } from '@/modules/order/domain/value-objects/order-status.vo';
import { OrderNotFoundError } from '../../errors/order.application-error';
import { OrderMapper } from '../../mappers/order.mapper';
import {
  ChangeOrderStatusRequestDto,
  ChangeOrderStatusRequestSchema,
} from '../../dtos/change-order-status.request.dto';
import { ChangeOrderStatusResponseDto } from '../../dtos/order.response.dto';
import { ILogger } from '@/shared/application/ports/logger/logger.interface';
import { ORDER_TYPES } from '@/modules/order/order.const';
import { IEventDispatcher } from '@/shared/application/ports/event-dispatcher/event-dispatcher.interface';
import { IOrderReadRepository } from '../../ports/repositories/order-read.repository';
import { IOrderWriteRepository } from '../../ports/repositories/order-write.repository';

/**
 * Command: Change Order Status
 * Command handler for changing order status
 */
@injectable()
export class ChangeOrderStatusCommand {
  constructor(
    @inject(ORDER_TYPES.OrderReadRepository) private readonly orderReadRepository: IOrderReadRepository,
    @inject(ORDER_TYPES.OrderWriteRepository) private readonly orderWriteRepository: IOrderWriteRepository,
    @inject(ORDER_TYPES.OrderDomainService) private readonly orderDomainService: OrderDomainService,
    @inject(ORDER_TYPES.OrderMapper) private readonly orderMapper: OrderMapper,
    @inject(TYPES.DomainEventsDispatcher) private readonly dispatcher: IEventDispatcher,
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
    const order = await this.orderReadRepository.findById(validatedRequest.orderId);

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

    // Save and dispatch events
    await this.orderWriteRepository.save(order);
    this.dispatcher.dispatchEventsForAggregate(order);

    // Return response DTO using mapper
    return this.orderMapper.toChangeOrderStatusResponseDto(order, previousStatus);
  }
}
