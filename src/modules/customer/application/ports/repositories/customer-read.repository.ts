import { CustomerAggregate } from '@/modules/customer/domain/aggregates/customer.aggregate';

export interface ICustomerReadRepository {
  findById(id: string): Promise<CustomerAggregate | null>;
  findByEmail(email: string): Promise<CustomerAggregate | null>;
}
