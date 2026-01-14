import { ITransactionClient } from "@/shared/application/ports/database/transaction-client.interface";
import { PrismaClient } from "@prisma/client";
import { injectable } from "inversify";

@injectable()
export class PrismaTransaction implements ITransactionClient {
  constructor(private readonly prisma: PrismaClient) {}

  async execute<T>(work: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async () => {
      return work();
    });
  }
}
