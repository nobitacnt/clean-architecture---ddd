import { Router } from 'express';
import { Container } from 'inversify';
import { OrderController } from '../controllers/order.controller';
import { ORDER_TYPES } from '@/modules/order/order.const';

/**
 * Setup order routes
 */
export function createOrderRoutes(container: Container): Router {
  const router = Router();
  const orderController = container.get<OrderController>(ORDER_TYPES.OrderController);

  // Create order
  router.post('/', (req, res) => orderController.createOrder(req, res));

  // Get order by ID
  router.get('/:id', (req, res) => orderController.getOrder(req, res));

  // Get all orders
  router.get('/', (req, res) => orderController.getAllOrders(req, res));

  // Change order status
  router.patch('/:id/status', (req, res) => orderController.changeOrderStatus(req, res));

  return router;
}
