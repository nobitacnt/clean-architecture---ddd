import { CustomerAggregate } from '@/modules/customer/domain/aggregates/customer.aggregate';

export interface ICustomerWriteRepository {
  save(customer: CustomerAggregate): Promise<void>;
}
