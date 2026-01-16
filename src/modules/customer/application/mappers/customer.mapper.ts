import { CustomerAggregate } from '@/modules/customer/domain/aggregates/customer.aggregate';
import { CreateCustomerResponseDto, CustomerResponseDto } from '../dtos/customer.response.dto';

export class CustomerMapper {
  static toCreateCustomerResponse(aggregate: CustomerAggregate): CreateCustomerResponseDto {
    return {
      id: aggregate.getId(),
      email: aggregate.email,
      name: aggregate.name,
      creditLimit: aggregate.creditLimit,
      isVerified: aggregate.isVerified,
      createdAt: aggregate.createdAt.toISOString(),
      message: 'Customer created successfully',
    };
  }

  static toCustomerResponse(aggregate: CustomerAggregate): CustomerResponseDto {
    return {
      id: aggregate.getId(),
      email: aggregate.email,
      name: aggregate.name,
      creditLimit: aggregate.creditLimit,
      isVerified: aggregate.isVerified,
      createdAt: aggregate.createdAt.toISOString(),
      updatedAt: aggregate.updatedAt.toISOString(),
    };
  }

  public toCreateCustomerResponseDto(aggregate: CustomerAggregate): CreateCustomerResponseDto {
    return CustomerMapper.toCreateCustomerResponse(aggregate);
  }
}
