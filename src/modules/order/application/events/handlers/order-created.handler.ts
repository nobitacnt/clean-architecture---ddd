
import { OrderCreatedEvent } from '@/modules/order/domain/events/order-created.event';
import { ILogger } from '@/shared/application/ports/logger/logger.interface';
import { TYPES } from '@/shared/common/di/types';
import { inject, injectable } from 'inversify';

/**
 * Event handler for OrderCreatedEvent
 * This is where you can add side effects when an order is created
 * Examples: Send email, update inventory, notify shipping service, etc.
 */
@injectable()
export class OrderCreatedEventHandler {
  @inject(TYPES.Logger) private readonly logger: ILogger

  /**
   * Handle the OrderCreated event
   */
  async handle(event: OrderCreatedEvent): Promise<void> {
    this.logger.info('Handling OrderCreated event', {
      orderId: event.orderId,
      customerId: event.customerId,
      totalAmount: event.totalAmount,
    });

    // Add your side effects here
    // Example: Send confirmation email
    await this.sendOrderConfirmationEmail(event);

    // Example: Reserve inventory
    await this.reserveInventory(event);

    // Example: Notify external systems
    await this.notifyExternalSystems(event);
  }

  private async sendOrderConfirmationEmail(event: OrderCreatedEvent): Promise<void> {
    this.logger.info('Sending order confirmation email', {
      orderId: event.orderId,
      customerId: event.customerId,
    });
    // TODO: Implement email sending logic
  }

  private async reserveInventory(event: OrderCreatedEvent): Promise<void> {
    this.logger.info('Reserving inventory for order', {
      orderId: event.orderId,
      items: event.items,
    });
    // TODO: Implement inventory reservation logic
  }

  private async notifyExternalSystems(event: OrderCreatedEvent): Promise<void> {
    this.logger.info('Notifying external systems about new order', {
      orderId: event.orderId,
    });
    // TODO: Implement external system notification logic
  }
}
