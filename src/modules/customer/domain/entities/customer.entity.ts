import { CustomerId } from '../value-objects/customer-id.vo';

export class CustomerEntity {
  readonly id: CustomerId;
  readonly email: string;
  readonly name: string;
  readonly creditLimit: number;
  readonly isVerified: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: CustomerId,
    email: string,
    name: string,
    creditLimit: number,
    isVerified: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.creditLimit = creditLimit;
    this.isVerified = isVerified;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(email: string, name: string, creditLimit: number = 100000): CustomerEntity {
    const now = new Date();
    return new CustomerEntity(
      CustomerId.create(),
      email,
      name,
      creditLimit,
      false,
      now,
      now
    );
  }

  static reconstitute(
    id: CustomerId,
    email: string,
    name: string,
    creditLimit: number,
    isVerified: boolean,
    createdAt: Date,
    updatedAt: Date
  ): CustomerEntity {
    return new CustomerEntity(id, email, name, creditLimit, isVerified, createdAt, updatedAt);
  }

  getId(): string {
    return this.id.toString();
  }
}
