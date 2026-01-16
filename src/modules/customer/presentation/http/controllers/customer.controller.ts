import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '@/shared/common/di/types';
import { CUSTOMER_TYPES } from '@/modules/customer/customer.const';
import { CreateCustomerCommand } from '@/modules/customer/application/use-cases/commands/create-customer.command';
import { BaseController } from '@/shared/presentation/http/controllers/base.controller';
import { ILogger } from '@/shared/application/ports/logger/logger.interface';

@injectable()
export class CustomerController extends BaseController {
  constructor(
    @inject(CUSTOMER_TYPES.CreateCustomerCommand)
    private readonly createCustomerUseCase: CreateCustomerCommand,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(logger);
  }

  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createCustomerUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      this.handleError(res, error, 'Error creating customer');
    }
  }
}
