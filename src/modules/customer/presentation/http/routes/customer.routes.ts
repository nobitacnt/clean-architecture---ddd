import { Router } from 'express';
import { Container } from 'inversify';
import { CUSTOMER_TYPES } from '@/modules/customer/customer.const';
import { CustomerController } from '../controllers/customer.controller';

export function createCustomerRoutes(container: Container): Router {
    const router = Router();

    const customerController = container.get<CustomerController>(CUSTOMER_TYPES.CustomerController);

    router.post('/', (req, res) => customerController.createCustomer(req, res));

    return router;
}
