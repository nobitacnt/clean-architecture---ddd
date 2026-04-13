import { injectable, inject } from 'inversify';

import { CustomerCreatedEvent } from '@/modules/customer/domain/events/customer-created.event';
import { ILogger } from '@/shared/application/ports/logger/logger.interface';
import { TYPES } from '@/shared/common/di/types';

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
