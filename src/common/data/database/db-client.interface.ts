import type { PrismaClient, Prisma } from '@prisma/client';

export type ITransactionClient = Prisma.TransactionClient;

export interface IDBClient {
  /**
   * Get the Prisma client instance
   */
  getClient(): Promise<PrismaClient>;
  
  /**
   * Execute a series of database operations within a transaction
   * @param callback - The callback function containing database operations
   */
  transaction<T>(callback: (tx: ITransactionClient) => Promise<T>): Promise<T>;
}
