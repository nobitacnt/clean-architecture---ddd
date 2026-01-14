import { BaseError } from '@/shared/common/errors/base.error';

/**
 * Base class for all domain exceptions in the Order module
 */
export class OrderDomainException extends BaseError {
  constructor(message: string, code?: string) {
    super(message, code, 400);
  }
}

/**
 * Exception thrown when order status transition is invalid
 */
export class InvalidOrderStatusTransitionException extends OrderDomainException {
  constructor(currentStatus: string, newStatus: string) {
    super(
      `Cannot transition order from ${currentStatus} to ${newStatus}`,
      'INVALID_STATUS_TRANSITION'
    );
  }
}

/**
 * Exception thrown when trying to modify a cancelled order
 */
export class OrderAlreadyCancelledException extends OrderDomainException {
  constructor() {
    super('Cannot modify an already cancelled order', 'ORDER_ALREADY_CANCELLED');
  }
}

/**
 * Exception thrown when order cannot be cancelled
 */
export class OrderCannotBeCancelledException extends OrderDomainException {
  constructor(reason: string) {
    super(`Order cannot be cancelled: ${reason}`, 'ORDER_CANNOT_BE_CANCELLED');
  }
}
