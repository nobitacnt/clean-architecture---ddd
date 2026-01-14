import { IDBClientManager } from "@/shared/application/ports/database/db-client-manager.interface";
import { ILogger } from "@/shared/application/ports/logger/logger.interface";
import { DatabaseRole } from "@/shared/common/const";
import { TYPES } from "@/shared/common/di/types";
import { PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";


@injectable()
export class PrismaClientManager implements IDBClientManager {
  private clients = new Map<DatabaseRole, PrismaClient>();
  private initializing = new Map<DatabaseRole, Promise<PrismaClient>>();

  constructor(
    @inject(TYPES.Logger)
    private readonly logger: ILogger,
  ) {}

  /**
   * get Prisma client for the given role
   * @param role 
   * @returns 
   */
  async getClient(role: DatabaseRole): Promise<PrismaClient> {
    const existing = this.clients.get(role);
    if (existing) return existing;

    let init = this.initializing.get(role);
    if (!init) {
      init = this.initClient(role);
      this.initializing.set(role, init);
    }

    return init;
  }

  private async initClient(role: DatabaseRole): Promise<PrismaClient> {
    const url = this.getDatabaseUrl(role);

    const client = new PrismaClient({
      datasources: {
        db: { url },
      },
    });

    try {
      await client.$connect();
      this.clients.set(role, client);
      this.logger.info(`Prisma ${role} database connected`);
      return client;
    } catch (err) {
      this.logger.error(`Failed to connect ${role} database`, err);
      throw err;
    }
  }

  private getDatabaseUrl(role: DatabaseRole): string {
    if (role === DatabaseRole.READ) {
      const url = process.env.DATABASE_URL_REPLICA;
      if (!url) {
        throw new Error('DATABASE_URL_REPLICA is required for READ database');
      }
      return url;
    }

    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is required for WRITE database');
    }
    return url;
  }
}
