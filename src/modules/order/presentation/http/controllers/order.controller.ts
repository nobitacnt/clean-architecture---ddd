import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '@/common/di/types';
import { CreateOrderCommand } from '@/modules/order/application/use-cases/commands/create-order.command';
import { GetOrderQuery } from '@/modules/order/application/use-cases/queries/get-order.query';
import { ChangeOrderStatusCommand } from '@/modules/order/application/use-cases/commands/change-order-status.command';
import { BaseController } from '@/common/controllers/base.controller';
import { ILogger } from '@/common/data/logger/logger.interface';

/**
 * Controller for Order HTTP endpoints
 */
@injectable()
export class OrderController extends BaseController {
  constructor(
    @inject(TYPES.CreateOrderCommand) private readonly createOrderCommand: CreateOrderCommand,
    @inject(TYPES.GetOrderQuery) private readonly getOrderQuery: GetOrderQuery,
    @inject(TYPES.ChangeOrderStatusCommand) private readonly changeOrderStatusCommand: ChangeOrderStatusCommand,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(logger);
  }

  /**
   * Create a new order
   * POST /api/orders
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      // Execute use case (validation is done inside with Zod)
      const result = await this.createOrderCommand.execute(req.body);

      // Return response
      res.status(201).json(result);
    } catch (error) {
      this.handleError(res, error, 'Error creating order');
    }
  }

  /**
   * Get an order by ID
   * GET /api/orders/:id
   */
  async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getOrderQuery.execute({
        orderId: req.params.id,
      });

      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error, 'Error getting order');
    }
  }

  /**
   * Get all orders
   * GET /api/orders
   */
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.getOrderQuery.executeList({ page, limit });

      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error, 'Error getting orders');
    }
  }

  /**
   * Change order status
   * PATCH /api/orders/:id/status
   */
  async changeOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.changeOrderStatusCommand.execute({
        orderId: req.params.id,
        newStatus: req.body.newStatus,
      });

      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error, 'Error changing order status');
    }
  }
}
