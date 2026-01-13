import { injectable, inject } from 'inversify';
import { TYPES} from '@/common/di/types';
import { InternalEventBus } from '@/common/data/event-bus/internal-event-bus.interface';
import { OrderCreatedEventHandler } from '@/modules/order/application/event-handlers/order-created.handler';
import { ILogger } from '@/common/data/logger/logger.interface';

/**
 * Register all order-related event handlers
 */
@injectable()
export class OrderEventHandlersRegistrar {
  constructor(
    @inject(TYPES.InternalEventBus) private readonly eventBus: InternalEventBus,
    @inject(TYPES.OrderCreatedEventHandler) private readonly orderCreatedHandler: OrderCreatedEventHandler,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  /**
   * Register all event handlers with the event bus
   */
  register(): void {
    this.logger.info('Registering order event handlers');

    // Register OrderCreated event handler
    this.eventBus.subscribe('OrderCreated', async (event) => {
      await this.orderCreatedHandler.handle(event as any);
    });

    // Register OrderStatusChanged event handler
    this.eventBus.subscribe('OrderStatusChanged', async (event) => {
      this.logger.info('Order status changed', {
        orderId: event.aggregateId,
        eventId: event.eventId,
      });
      // Add more handlers here as needed
    });

    this.logger.info('Order event handlers registered successfully');
  }
}
