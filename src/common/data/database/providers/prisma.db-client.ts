import { PrismaClient } from '@prisma/client';

import { injectable } from 'inversify';
import { IDBClient, ITransactionClient } from '../db-client.interface';
import { Logger } from '@/common/data/logger/providers/simple-logger';
import { inject } from 'inversify';
import { TYPES } from '@/common/di/types';

/**
 * Responsible for managing database connections. (Postgres)
 */
@injectable()
export class PrismaDBClient implements IDBClient {
  private dbClient: PrismaClient | null = null;

  constructor(
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  async getClient(): Promise<PrismaClient> {
    if (this.dbClient) return this.dbClient;

    try {
      this.dbClient = new PrismaClient();
      await this.dbClient.$connect();
      this.logger.info('Database connection established successfully.');
    } catch (error) {
      this.logger.error('Failed to connect to the database.', error);
      throw error;
    }

    return this.dbClient;
  }

  async transaction<T>(callback: (tx: ITransactionClient) => Promise<T>): Promise<T> {
    const dbClient =  await this.getClient();
    return dbClient.$transaction(async (tx) => callback(tx));
  }
}
