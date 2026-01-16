import { ILogger } from '@/shared/application/ports/logger/logger.interface';
import { OrderStatusChangedEvent } from '@/modules/order/domain/events/order-status-changed.event';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/shared/common/di/types';

/**
 * Event handler for OrderStatusChangedEvent
 * This is where you can add side effects when an order status is changed
 * Examples: Send email, notify shipping service, etc.
 */
@injectable()
export class OrderStatusChangedEventHandler {
  constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {}

  /**
   * Handle the OrderStatusChanged  event
   */
  async handle(event: OrderStatusChangedEvent): Promise<void> {
    this.logger.info('Handling OrderStatusChanged event', {
      orderId: event.orderId,
      previousStatus: event.previousStatus,
      newStatus: event.newStatus,
    });

    // Add your side effects here
    // Example: Send confirmation email
    await this.sendOrderConfirmationEmail(event);

    // Example: Notify external systems
    await this.notifyExternalSystems(event);
  }

  private async sendOrderConfirmationEmail(event: OrderStatusChangedEvent): Promise<void> {
    this.logger.info('Sending order status changed email', {
      orderId: event.orderId,
      previousStatus: event.previousStatus,
      newStatus: event.newStatus,
    });
    // TODO: Implement email sending logic
  }

  private async notifyExternalSystems(event: OrderStatusChangedEvent): Promise<void> {
    this.logger.info('Notifying external systems about change status order', {
      orderId: event.orderId,
    });
    // TODO: Implement external system notification logic
  }
}
