import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/common/di/types';
import { ILogger } from '@/shared/application/ports/logger/logger.interface';
import { CustomerCreatedEvent } from '@/modules/customer/domain/events/customer-created.event';

@injectable()
export class CustomerCreatedEventHandler {
  constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {}

  async handle(event: CustomerCreatedEvent): Promise<void> {
    this.logger.info('Customer created event handled', {
      customerId: event.customerId,
      email: event.email,
      name: event.name,
      creditLimit: event.creditLimit,
    });
  }
}
