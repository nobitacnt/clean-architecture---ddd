import { BaseError } from '@/shared/common/errors/base.error';

/**
 * Base class for application-level errors
 */
export class OrderApplicationError extends BaseError {
  constructor(message: string, code?: string, statusCode: number = 400) {
    super(message, code, statusCode);
  }
}

/**
 * Error thrown when order creation fails
 */
export class OrderCreationFailedError extends OrderApplicationError {
  constructor(reason: string) {
    super(`Failed to create order: ${reason}`, 'ORDER_CREATION_FAILED');
  }
}

/**
 * Error thrown when order is not found
 */
export class OrderNotFoundError extends OrderApplicationError {
  constructor(orderId: string) {
    super(`Order with ID ${orderId} not found`, 'ORDER_NOT_FOUND', 404);
  }
}
