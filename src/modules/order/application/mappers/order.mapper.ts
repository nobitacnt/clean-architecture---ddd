import { OrderAggregate } from '@/modules/order/domain/aggregates/order.aggregate';
import {
  OrderResponseDto,
  CreateOrderResponseDto,
  ChangeOrderStatusResponseDto,
  OrdersListResponseDto,
} from '../dtos/order.response.dto';

/**
 * Mapper for converting between domain aggregates and response DTOs
 */
export class OrderMapper {
  /**
   * Map aggregate to OrderResponseDto
   */
  static toOrderResponse(aggregate: OrderAggregate): OrderResponseDto {
    return {
      id: aggregate.id.toString(),
      customerId: aggregate.customerId,
      items: aggregate.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
      totalAmount: aggregate.totalAmount,
      status: aggregate.status.toString(),
      createdAt: aggregate.createdAt.toISOString(),
      updatedAt: aggregate.updatedAt.toISOString(),
    };
  }

  /**
   * Map aggregate to CreateOrderResponseDto
   */
  static toCreateOrderResponse(aggregate: OrderAggregate): CreateOrderResponseDto {
    return {
      id: aggregate.id.toString(),
      customerId: aggregate.customerId,
      totalAmount: aggregate.totalAmount,
      status: aggregate.status.toString(),
      createdAt: aggregate.createdAt.toISOString(),
      message: 'Order created successfully',
    };
  }

  /**
   * Map aggregate to ChangeOrderStatusResponseDto
   */
  static toChangeStatusResponse(
    aggregate: OrderAggregate,
    previousStatus: string
  ): ChangeOrderStatusResponseDto {
    return {
      id: aggregate.id.toString(),
      previousStatus,
      newStatus: aggregate.status.toString(),
      updatedAt: aggregate.updatedAt.toISOString(),
      message: 'Order status changed successfully',
    };
  }

  /**
   * Map multiple aggregates to OrdersListResponseDto
   */
  static toOrdersListResponse(
    aggregates: OrderAggregate[],
    page: number,
    limit: number
  ): OrdersListResponseDto {
    return {
      data: aggregates.map((aggregate) => this.toOrderResponse(aggregate)),
      pagination: {
        page,
        limit,
        total: aggregates.length,
      },
    };
  }

  /**
   * Map to ChangeOrderStatusResponseDto
   */
  public toChangeOrderStatusResponseDto(
    order: OrderAggregate,
    previousStatus: string,
    message?: string
  ): ChangeOrderStatusResponseDto {
    return {
      id: order.id.toString(),
      previousStatus,
      newStatus: order.status.toString(),
      updatedAt: order.updatedAt.toISOString(),
      message: message || 'Order status changed successfully',
    };
  }
}
