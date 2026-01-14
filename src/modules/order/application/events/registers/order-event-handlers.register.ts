import { injectable, inject } from 'inversify';
import { TYPES} from '@/shared/common/di/types';
import { ILogger } from '@/shared/application/ports/logger/logger.interface';
import { IEventBus } from '@/shared/application/ports/event-bus/event-bus.interface';
import { ORDER_EVENTS } from '@/modules/order/domain/events/event.const';
import { OrderCreatedEvent } from '@/modules/order/domain/events/order-created.event';
import { OrderStatusChangedEvent } from '@/modules/order/domain/events/order-status-changed.event';
import { OrderCreatedEventHandler } from '../handlers/order-created.handler';
import { OrderStatusChangedEventHandler } from '../handlers/order-status-changed.handler';

/**
 * Register all order-related event handlers
 */
@injectable()
export class OrderEventHandlersRegistrar {
  constructor(
    @inject(TYPES.InternalEventBus) private readonly eventBus: IEventBus,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  /**
   * Register all event handlers with the event bus
   */
  register(): void {
    this.logger.info('Registering order event handlers');

    // Register OrderCreated event handler
    this.eventBus.subscribe(ORDER_EVENTS.OrderCreated, async (event) => {
      await (new OrderCreatedEventHandler(this.logger)).handle(event as OrderCreatedEvent);
    });

    // Register OrderStatusChanged event handler
    this.eventBus.subscribe(ORDER_EVENTS.OrderStatusChanged, async (event) => {
      await (new OrderStatusChangedEventHandler(this.logger)).handle(event as OrderStatusChangedEvent);
    });

    this.logger.info('Order event handlers registered successfully');
  }
}
