import { BaseError } from '@/shared/common/errors/base.error';

export class CustomerApplicationError extends BaseError {
  constructor(message: string, code: string = 'CUSTOMER_ERROR') {
    super(message, code);
  }
}

export class CustomerAlreadyExistsError extends CustomerApplicationError {
  constructor(email: string) {
    super(`Customer with email ${email} already exists`, 'CUSTOMER_ALREADY_EXISTS');
  }
}

export class CustomerNotFoundError extends CustomerApplicationError {
  constructor(id: string) {
    super(`Customer with ID ${id} not found`, 'CUSTOMER_NOT_FOUND');
  }
}
