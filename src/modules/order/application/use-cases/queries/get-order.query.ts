import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/common/di/types';
import { OrderNotFoundError } from '../../errors/order.application-error';
import {
  GetOrderRequestDto,
  GetOrderRequestSchema,
  GetOrdersListRequestDto,
  GetOrdersListRequestSchema,
} from '../../dtos/get-order.request.dto';
import { OrderResponseDto, OrdersListResponseDto } from '../../dtos/order.response.dto';
import { OrderMapper } from '../../mappers/order.mapper';
import { ILogger } from '@/shared/application/ports/logger/logger.interface';
import { ORDER_TYPES } from '@/modules/order/order.const';
import { IOrderReadRepository } from '../../ports/repositories/order-read.repository';

/**
 * Query: Get Order
 * Query handler for retrieving order(s)
 */
@injectable()
export class GetOrderQuery {
  constructor(
    @inject(ORDER_TYPES.OrderReadRepository) private readonly orderReadRepository: IOrderReadRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  /**
   * Execute get single order query
   * @param request - GetOrderRequestDto (validated with Zod)
   * @returns OrderResponseDto
   */
  async execute(request: GetOrderRequestDto): Promise<OrderResponseDto> {
    // Validate request with Zod
    const validatedRequest = GetOrderRequestSchema.parse(request);

    this.logger.info('Getting order', { orderId: validatedRequest.orderId });

    const order = await this.orderReadRepository.findById(validatedRequest.orderId);

    if (!order) {
      this.logger.warn('Order not found', { orderId: validatedRequest.orderId });
      throw new OrderNotFoundError(validatedRequest.orderId);
    }

    // Map to response DTO
    return OrderMapper.toOrderResponse(order);
  }

  /**
   * Execute get orders list query
   * @param request - GetOrdersListRequestDto (validated with Zod)
   * @returns OrdersListResponseDto
   */
  async executeList(request: GetOrdersListRequestDto): Promise<OrdersListResponseDto> {
    // Validate request with Zod
    const validatedRequest = GetOrdersListRequestSchema.parse(request);

    this.logger.info('Getting orders list', {
      page: validatedRequest.page,
      limit: validatedRequest.limit,
    });

    const orders = await this.orderReadRepository.findAll(
      validatedRequest.page,
      validatedRequest.limit
    );

    // Map to response DTOs
    return OrderMapper.toOrdersListResponse(orders, validatedRequest.page, validatedRequest.limit);
  }
}
