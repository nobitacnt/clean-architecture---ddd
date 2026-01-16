import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/common/di/types';
import { ICustomerReadRepository } from '@/modules/customer/application/ports/repositories/customer-read.repository';
import { CustomerAggregate } from '@/modules/customer/domain/aggregates/customer.aggregate';
import { CustomerEntity } from '@/modules/customer/domain/entities/customer.entity';
import { CustomerId } from '@/modules/customer/domain/value-objects/customer-id.vo';
import { DatabaseRole } from '@/shared/common/const';
import { PrismaClientManager } from '@/shared/infrastructure/database/prisma-client-manager';
import { CustomerModel } from '../models/customer.model';

@injectable()
export class CustomerReadRepositoryImpl implements ICustomerReadRepository {
  constructor(
    @inject(TYPES.DBClientManager) private readonly dbClientManager: PrismaClientManager
  ) {}

  private async getDbClient() {
    return await this.dbClientManager.getClient(DatabaseRole.READ);
  }

  async findById(id: string): Promise<CustomerAggregate | null> {
    const db = await this.getDbClient();
    const customer = await db.customer.findUnique({ where: { id } });

    if (!customer) return null;

    return this.toDomain(customer);
  }

  async findByEmail(email: string): Promise<CustomerAggregate | null> {
    const db = await this.getDbClient();
    const customer = await db.customer.findUnique({ where: { email } });

    if (!customer) return null;

    return this.toDomain(customer);
  }

  private toDomain(model: CustomerModel): CustomerAggregate {
    const entity = CustomerEntity.reconstitute(
      CustomerId.fromString(model.id),
      model.email,
      model.name,
      model.creditLimit,
      model.isVerified,
      model.createdAt,
      model.updatedAt
    );

    return CustomerAggregate.fromEntity(entity);
  }
}
