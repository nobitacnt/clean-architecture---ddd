import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/common/di/types';
import { CUSTOMER_TYPES } from '@/modules/customer/customer.const';
import { ICustomerWriteRepository } from '../../ports/repositories/customer-write.repository';
import { ICustomerReadRepository } from '../../ports/repositories/customer-read.repository';
import { CustomerAggregate } from '@/modules/customer/domain/aggregates/customer.aggregate';
import { CustomerAlreadyExistsError } from '../../errors/customer.application-error';
import {
  CreateCustomerRequestDto,
  CreateCustomerRequestSchema,
} from '../../dtos/create-customer.request.dto';
import { CreateCustomerResponseDto } from '../../dtos/customer.response.dto';
import { CustomerMapper } from '../../mappers/customer.mapper';
import { IEventDispatcher } from '@/shared/application/ports/event-dispatcher/event-dispatcher.interface';

@injectable()
export class CreateCustomerCommand {
  constructor(
    @inject(CUSTOMER_TYPES.CustomerWriteRepository)
    private readonly customerWriteRepository: ICustomerWriteRepository,
    @inject(CUSTOMER_TYPES.CustomerReadRepository)
    private readonly customerReadRepository: ICustomerReadRepository,
    @inject(CUSTOMER_TYPES.CustomerMapper)
    private readonly customerMapper: CustomerMapper,
    @inject(TYPES.DomainEventsDispatcher)
    private readonly dispatcher: IEventDispatcher
  ) {}

  async execute(request: CreateCustomerRequestDto): Promise<CreateCustomerResponseDto> {
    const validatedRequest = CreateCustomerRequestSchema.parse(request);

    const existingCustomer = await this.customerReadRepository.findByEmail(validatedRequest.email);
    if (existingCustomer) {
      throw new CustomerAlreadyExistsError(validatedRequest.email);
    }

    const customer = CustomerAggregate.create(
      validatedRequest.email,
      validatedRequest.name,
      validatedRequest.creditLimit
    );

    await this.customerWriteRepository.save(customer);
    this.dispatcher.dispatchEventsForAggregate(customer);

    return this.customerMapper.toCreateCustomerResponseDto(customer);
  }
}
