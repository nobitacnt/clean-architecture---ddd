import { ZodError } from 'zod';
import { injectable } from 'inversify';
import { Response } from 'express';
import { ILogger } from '../data/logger/logger.interface';

@injectable()
export abstract class BaseController {
  constructor(protected readonly logger: ILogger) {}

  /**
   * Handle errors consistently
   */
  protected handleError(res: Response, error: unknown, message: string): void {
    this.logger.error(message, error);

    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not found',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        error: message,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: message,
      message: 'Unknown error',
    });
  }
}