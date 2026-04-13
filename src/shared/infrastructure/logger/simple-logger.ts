import { injectable } from 'inversify';

import { ILogger } from '@/shared/application/ports/logger/logger.interface';

/**
 * Simple logger implementation
 * In production, you might want to use Winston, Pino, or another logging library
 */
@injectable()
export class SimpleLogger implements ILogger {
  private formatMessage(level: string, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  info(message: string, meta?: unknown): void {
    console.log(this.formatMessage('INFO', message, meta));
  }

  error(message: string, error?: unknown): void {
    console.error(this.formatMessage('ERROR', message, error));
  }

  warn(message: string, meta?: unknown): void {
    console.warn(this.formatMessage('WARN', message, meta));
  }

  debug(message: string, meta?: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('DEBUG', message, meta));
    }
  }
}
