import { AggregateRoot } from '@/shared/domain/events/aggregate-root';
import { CustomerEntity } from '../entities/customer.entity';
import { CustomerId } from '../value-objects/customer-id.vo';
import { CustomerCreatedEvent } from '../events/customer-created.event';

export class CustomerAggregate extends AggregateRoot {
  private customer: CustomerEntity;

  private constructor(customer: CustomerEntity) {
    super();
    this.customer = customer;
  }

  static create(email: string, name: string, creditLimit?: number): CustomerAggregate {
    const customer = CustomerEntity.create(email, name, creditLimit);
    const aggregate = new CustomerAggregate(customer);

    aggregate.addDomainEvent(
      new CustomerCreatedEvent(
        customer.id.toString(),
        customer.email,
        customer.name,
        customer.creditLimit
      )
    );

    return aggregate;
  }

  static fromEntity(customer: CustomerEntity): CustomerAggregate {
    return new CustomerAggregate(customer);
  }

  getId(): string {
    return this.customer.getId();
  }

  get id(): CustomerId {
    return this.customer.id;
  }

  get email(): string {
    return this.customer.email;
  }

  get name(): string {
    return this.customer.name;
  }

  get creditLimit(): number {
    return this.customer.creditLimit;
  }

  get isVerified(): boolean {
    return this.customer.isVerified;
  }

  get createdAt(): Date {
    return this.customer.createdAt;
  }

  get updatedAt(): Date {
    return this.customer.updatedAt;
  }
}
