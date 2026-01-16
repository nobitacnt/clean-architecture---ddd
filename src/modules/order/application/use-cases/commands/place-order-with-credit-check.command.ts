import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/common/di/types';
import { ORDER_TYPES } from '@/modules/order/order.const';
import { IOrderWriteRepository } from '../../ports/repositories/order-write.repository';
import { OrderAggregate } from '@/modules/order/domain/aggregates/order.aggregate';
import { OrderPlacementDomainService } from '@/modules/order/domain/services/order-placement-domain.service';
import { OrderMapper } from '../../mappers/order.mapper';
import { IEventDispatcher } from '@/shared/application/ports/event-dispatcher/event-dispatcher.interface';
import {
  PlaceOrderWithCreditCheckRequestDto,
  PlaceOrderWithCreditCheckRequestSchema,
} from '../../dtos/place-order-with-credit-check.request.dto';
import { PlaceOrderWithCreditCheckResponseDto } from '../../dtos/place-order-with-credit-check.response.dto';

@injectable()
export class PlaceOrderWithCreditCheckCommand {
  constructor(
    @inject(ORDER_TYPES.OrderWriteRepository) 
    private readonly orderWriteRepository: IOrderWriteRepository,
    @inject(ORDER_TYPES.OrderPlacementDomainService) 
    private readonly orderPlacementService: OrderPlacementDomainService,
    @inject(ORDER_TYPES.OrderMapper) 
    private readonly orderMapper: OrderMapper,
    @inject(TYPES.DomainEventsDispatcher) 
    private readonly dispatcher: IEventDispatcher
  ) {}

  private getCustomerData() {
    // TODO: Fetch from CustomerRepository in real implementation
    return {
      creditLimit: 100000,
      totalPendingOrders: 25000,
      isVerified: true,
      riskLevel: 'LOW' as const,
      totalOrders: 10,
      accountAge: 180,
    };
  }

  async execute(request: PlaceOrderWithCreditCheckRequestDto): Promise<PlaceOrderWithCreditCheckResponseDto> {
    const validatedRequest = PlaceOrderWithCreditCheckRequestSchema.parse(request);

    const order = OrderAggregate.create(validatedRequest.customerId, validatedRequest.items);

    
    const customerData = this.getCustomerData();

    const canPlace = this.orderPlacementService.canPlaceOrder(
      order,
      customerData.creditLimit,
      customerData.totalPendingOrders,
      customerData.isVerified
    );

    if (!canPlace.allowed) {
      return this.orderMapper.toPlaceOrderWithCreditCheckResponseDto(
        order, false, false, 0, canPlace.reason
      );
    }

    const requiredDeposit = this.orderPlacementService.calculateRequiredDeposit(
      order.totalAmount,
      customerData.riskLevel,
      customerData.totalOrders
    );

    const requiresManualApproval = this.orderPlacementService.requiresManualApproval(
      order.totalAmount,
      order.items.length,
      customerData.isVerified,
      customerData.accountAge,
      customerData.totalOrders
    );

    await this.orderWriteRepository.save(order);
    this.dispatcher.dispatchEventsForAggregate(order);

    return this.orderMapper.toPlaceOrderWithCreditCheckResponseDto(
      order,
      true,
      requiresManualApproval,
      requiredDeposit,
      requiresManualApproval 
        ? 'Order placed but requires manual approval'
        : 'Order placed successfully'
    );
  }
}
