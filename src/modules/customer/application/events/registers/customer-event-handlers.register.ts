import { IEventBus } from '@/shared/application/ports/event-bus/event-bus.interface';
import { ILogger } from '@/shared/application/ports/logger/logger.interface';
import { CUSTOMER_EVENTS } from '@/modules/customer/domain/events/event.const';
import { CustomerCreatedEvent } from '@/modules/customer/domain/events/customer-created.event';
import { CustomerCreatedEventHandler } from '../handlers/customer-created.handler';

export class CustomerEventHandlersRegistrar {
  constructor(
    private readonly eventBus: IEventBus,
    private readonly customerCreatedHandler: CustomerCreatedEventHandler,
    private readonly logger: ILogger
  ) {}

  register(): void {
    this.eventBus.subscribe(
      CUSTOMER_EVENTS.CUSTOMER_CREATED,
      async (event) => {
        await this.customerCreatedHandler.handle(event as CustomerCreatedEvent);
      }
    );

    this.logger.info('Customer event handlers registered');
  }
}
