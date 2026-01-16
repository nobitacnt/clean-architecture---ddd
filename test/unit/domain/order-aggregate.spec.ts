import 'reflect-metadata';
import { OrderAggregate } from '../../../src/modules/order/domain/aggregates/order.aggregate';
import { OrderStatus } from '../../../src/modules/order/domain/value-objects/order-status.vo';
import { OrderItem } from '../../../src/modules/order/domain/entities/order.entity';

describe('OrderAggregate', () => {
  describe('create', () => {
    it('should create a new order with pending status', () => {
      // Arrange
      const customerId = 'customer-123';
      const items: OrderItem[] = [
        {
          productId: 'prod-1',
          productName: 'Product 1',
          quantity: 2,
          price: 100,
        },
      ];

      // Act
      const order = OrderAggregate.create(customerId, items);

      // Assert
      expect(order).toBeDefined();
      expect(order.customerId).toBe(customerId);
      expect(order.status.isPending()).toBe(true);
      expect(order.items).toHaveLength(1);
      expect(order.totalAmount).toBe(200);
      expect(order.getId()).toBeDefined();
    });

    it('should calculate total amount correctly with multiple items', () => {
      // Arrange
      const items: OrderItem[] = [
        { productId: 'prod-1', productName: 'Product 1', quantity: 2, price: 100 },
        { productId: 'prod-2', productName: 'Product 2', quantity: 3, price: 50 },
      ];

      // Act
      const order = OrderAggregate.create('customer-123', items);

      // Assert
      expect(order.totalAmount).toBe(350); // (2*100) + (3*50)
      expect(order.items).toHaveLength(2);
    });
  });

  describe('changeStatus', () => {
    it('should change status from PENDING to CONFIRMED', () => {
      // Arrange
      const order = OrderAggregate.create('customer-123', [
        { productId: 'prod-1', productName: 'Product 1', quantity: 1, price: 100 },
      ]);

      // Act
      order.changeStatus(OrderStatus.fromString('CONFIRMED'));

      // Assert
      expect(order.status.isConfirmed()).toBe(true);
    });

    it('should change status through full lifecycle', () => {
      // Arrange
      const order = OrderAggregate.create('customer-123', [
        { productId: 'prod-1', productName: 'Product 1', quantity: 1, price: 100 },
      ]);

      // Act & Assert - PENDING -> CONFIRMED
      order.changeStatus(OrderStatus.fromString('CONFIRMED'));
      expect(order.status.isConfirmed()).toBe(true);

      // CONFIRMED -> PROCESSING
      order.changeStatus(OrderStatus.fromString('PROCESSING'));
      expect(order.status.toString()).toBe('PROCESSING');

      // PROCESSING -> SHIPPED
      order.changeStatus(OrderStatus.fromString('SHIPPED'));
      expect(order.status.toString()).toBe('SHIPPED');

      // SHIPPED -> DELIVERED
      order.changeStatus(OrderStatus.fromString('DELIVERED'));
      expect(order.status.isDelivered()).toBe(true);
    });

    it('should throw error when trying invalid status transition', () => {
      // Arrange
      const order = OrderAggregate.create('customer-123', [
        { productId: 'prod-1', productName: 'Product 1', quantity: 1, price: 100 },
      ]);

      // Act & Assert - Cannot go directly from PENDING to DELIVERED
      expect(() => order.changeStatus(OrderStatus.fromString('DELIVERED'))).toThrow();
    });

    it('should throw error when changing from DELIVERED status', () => {
      // Arrange
      const order = OrderAggregate.create('customer-123', [
        { productId: 'prod-1', productName: 'Product 1', quantity: 1, price: 100 },
      ]);
      order.changeStatus(OrderStatus.fromString('CONFIRMED'));
      order.changeStatus(OrderStatus.fromString('PROCESSING'));
      order.changeStatus(OrderStatus.fromString('SHIPPED'));
      order.changeStatus(OrderStatus.fromString('DELIVERED'));

      // Act & Assert
      expect(() => order.changeStatus(OrderStatus.fromString('CANCELLED'))).toThrow();
    });

    it('should throw error when changing from CANCELLED status', () => {
      // Arrange
      const order = OrderAggregate.create('customer-123', [
        { productId: 'prod-1', productName: 'Product 1', quantity: 1, price: 100 },
      ]);
      order.cancel();

      // Act & Assert
      expect(() => order.changeStatus(OrderStatus.fromString('CONFIRMED'))).toThrow();
    });
  });

  describe('cancel', () => {
    it('should cancel order from PENDING status', () => {
      // Arrange
      const order = OrderAggregate.create('customer-123', [
        { productId: 'prod-1', productName: 'Product 1', quantity: 1, price: 100 },
      ]);

      // Act
      order.cancel();

      // Assert
      expect(order.status.isCancelled()).toBe(true);
    });

    it('should cancel order from CONFIRMED status', () => {
      // Arrange
      const order = OrderAggregate.create('customer-123', [
        { productId: 'prod-1', productName: 'Product 1', quantity: 1, price: 100 },
      ]);
      order.changeStatus(OrderStatus.fromString('CONFIRMED'));

      // Act
      order.cancel();

      // Assert
      expect(order.status.isCancelled()).toBe(true);
    });

    it('should throw error when cancelling DELIVERED order', () => {
      // Arrange
      const order = OrderAggregate.create('customer-123', [
        { productId: 'prod-1', productName: 'Product 1', quantity: 1, price: 100 },
      ]);
      order.changeStatus(OrderStatus.fromString('CONFIRMED'));
      order.changeStatus(OrderStatus.fromString('PROCESSING'));
      order.changeStatus(OrderStatus.fromString('SHIPPED'));
      order.changeStatus(OrderStatus.fromString('DELIVERED'));

      // Act & Assert
      expect(() => order.cancel()).toThrow();
    });

    it('should throw error when cancelling already CANCELLED order', () => {
      // Arrange
      const order = OrderAggregate.create('customer-123', [
        { productId: 'prod-1', productName: 'Product 1', quantity: 1, price: 100 },
      ]);
      order.cancel();

      // Act & Assert
      expect(() => order.cancel()).toThrow();
    });
  });

  describe('confirm', () => {
    it('should confirm order from PENDING status', () => {
      // Arrange
      const order = OrderAggregate.create('customer-123', [
        { productId: 'prod-1', productName: 'Product 1', quantity: 1, price: 100 },
      ]);

      // Act
      order.confirm();

      // Assert
      expect(order.status.isConfirmed()).toBe(true);
    });

    it('should throw error when confirming already CANCELLED order', () => {
      // Arrange
      const order = OrderAggregate.create('customer-123', [
        { productId: 'prod-1', productName: 'Product 1', quantity: 1, price: 100 },
      ]);
      order.cancel();

      // Act & Assert
      expect(() => order.confirm()).toThrow();
    });
  });

  describe('Order Properties', () => {
    it('should have correct order properties', () => {
      // Arrange & Act
      const customerId = 'customer-456';
      const items: OrderItem[] = [
        { productId: 'prod-1', productName: 'Product 1', quantity: 2, price: 50 },
      ];
      const order = OrderAggregate.create(customerId, items);

      // Assert
      expect(order.customerId).toBe(customerId);
      expect(order.items).toEqual(items);
      expect(order.totalAmount).toBe(100);
      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });

    it('should have unique order IDs', () => {
      // Act
      const order1 = OrderAggregate.create('customer-123', [
        { productId: 'prod-1', productName: 'Product 1', quantity: 1, price: 100 },
      ]);
      const order2 = OrderAggregate.create('customer-123', [
        { productId: 'prod-1', productName: 'Product 1', quantity: 1, price: 100 },
      ]);

      // Assert
      expect(order1.getId()).not.toBe(order2.getId());
    });
  });
});
