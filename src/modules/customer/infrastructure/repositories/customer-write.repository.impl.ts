import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/common/di/types';
import { ICustomerWriteRepository } from '@/modules/customer/application/ports/repositories/customer-write.repository';
import { CustomerAggregate } from '@/modules/customer/domain/aggregates/customer.aggregate';
import { DatabaseRole } from '@/shared/common/const';
import { PrismaClientManager } from '@/shared/infrastructure/database/prisma-client-manager';

@injectable()
export class CustomerWriteRepositoryImpl implements ICustomerWriteRepository {
  constructor(
    @inject(TYPES.DBClientManager) private readonly dbClientManager: PrismaClientManager
  ) {}

  private async getDbClient() {
    return await this.dbClientManager.getClient(DatabaseRole.WRITE);
  }

  async save(customer: CustomerAggregate): Promise<void> {
    const db = await this.getDbClient();

    await db.customer.upsert({
      where: { id: customer.getId() },
      create: {
        id: customer.getId(),
        email: customer.email,
        name: customer.name,
        creditLimit: customer.creditLimit,
        isVerified: customer.isVerified,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
      update: {
        email: customer.email,
        name: customer.name,
        creditLimit: customer.creditLimit,
        isVerified: customer.isVerified,
        updatedAt: customer.updatedAt,
      },
    });
  }
}
