import { BaseError } from './base.error';

/**
 * Error thrown when a resource is not found
 */
export class NotFoundError extends BaseError {
  constructor(resource: string, identifier: string) {
    super(
      `${resource} with identifier '${identifier}' not found`,
      'NOT_FOUND',
      404
    );
  }
}
