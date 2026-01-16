import { OrderStatus } from '../../../src/modules/order/domain/value-objects/order-status.vo';

describe('OrderStatus Value Object', () => {
  describe('creation', () => {
    it('should create PENDING status', () => {
      // Act
      const status = OrderStatus.createPending();

      // Assert
      expect(status.isPending()).toBe(true);
      expect(status.toString()).toBe('PENDING');
    });

    it('should create from valid string', () => {
      // Act
      const status = OrderStatus.fromString('CONFIRMED');

      // Assert
      expect(status.isConfirmed()).toBe(true);
      expect(status.toString()).toBe('CONFIRMED');
    });

    it('should throw error for invalid status string', () => {
      // Act & Assert
      expect(() => OrderStatus.fromString('INVALID_STATUS')).toThrow();
    });
  });

  describe('status checks', () => {
    it('should correctly identify PENDING status', () => {
      const status = OrderStatus.fromString('PENDING');
      expect(status.isPending()).toBe(true);
      expect(status.isConfirmed()).toBe(false);
      expect(status.isCancelled()).toBe(false);
      expect(status.isDelivered()).toBe(false);
    });

    it('should correctly identify CONFIRMED status', () => {
      const status = OrderStatus.fromString('CONFIRMED');
      expect(status.isConfirmed()).toBe(true);
      expect(status.isPending()).toBe(false);
    });

    it('should correctly identify CANCELLED status', () => {
      const status = OrderStatus.fromString('CANCELLED');
      expect(status.isCancelled()).toBe(true);
      expect(status.isPending()).toBe(false);
    });

    it('should correctly identify DELIVERED status', () => {
      const status = OrderStatus.fromString('DELIVERED');
      expect(status.isDelivered()).toBe(true);
      expect(status.isPending()).toBe(false);
    });
  });

  describe('status transitions', () => {
    it('should allow transition from PENDING to CONFIRMED', () => {
      const pending = OrderStatus.fromString('PENDING');
      const confirmed = OrderStatus.fromString('CONFIRMED');

      expect(pending.canTransitionTo(confirmed)).toBe(true);
    });

    it('should allow transition from PENDING to CANCELLED', () => {
      const pending = OrderStatus.fromString('PENDING');
      const cancelled = OrderStatus.fromString('CANCELLED');

      expect(pending.canTransitionTo(cancelled)).toBe(true);
    });

    it('should allow transition from CONFIRMED to PROCESSING', () => {
      const confirmed = OrderStatus.fromString('CONFIRMED');
      const processing = OrderStatus.fromString('PROCESSING');

      expect(confirmed.canTransitionTo(processing)).toBe(true);
    });

    it('should allow transition from PROCESSING to SHIPPED', () => {
      const processing = OrderStatus.fromString('PROCESSING');
      const shipped = OrderStatus.fromString('SHIPPED');

      expect(processing.canTransitionTo(shipped)).toBe(true);
    });

    it('should allow transition from SHIPPED to DELIVERED', () => {
      const shipped = OrderStatus.fromString('SHIPPED');
      const delivered = OrderStatus.fromString('DELIVERED');

      expect(shipped.canTransitionTo(delivered)).toBe(true);
    });

    it('should NOT allow transition from PENDING to DELIVERED', () => {
      const pending = OrderStatus.fromString('PENDING');
      const delivered = OrderStatus.fromString('DELIVERED');

      expect(pending.canTransitionTo(delivered)).toBe(false);
    });

    it('should NOT allow transition from DELIVERED to any status', () => {
      const delivered = OrderStatus.fromString('DELIVERED');
      const cancelled = OrderStatus.fromString('CANCELLED');

      expect(delivered.canTransitionTo(cancelled)).toBe(false);
    });

    it('should NOT allow transition from CANCELLED to any status', () => {
      const cancelled = OrderStatus.fromString('CANCELLED');
      const confirmed = OrderStatus.fromString('CONFIRMED');

      expect(cancelled.canTransitionTo(confirmed)).toBe(false);
    });
  });

  describe('equality', () => {
    it('should be equal to another status with same value', () => {
      const status1 = OrderStatus.fromString('CONFIRMED');
      const status2 = OrderStatus.fromString('CONFIRMED');

      expect(status1.equals(status2)).toBe(true);
    });

    it('should NOT be equal to another status with different value', () => {
      const status1 = OrderStatus.fromString('CONFIRMED');
      const status2 = OrderStatus.fromString('PENDING');

      expect(status1.equals(status2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return correct string representation', () => {
      expect(OrderStatus.fromString('PENDING').toString()).toBe('PENDING');
      expect(OrderStatus.fromString('CONFIRMED').toString()).toBe('CONFIRMED');
      expect(OrderStatus.fromString('PROCESSING').toString()).toBe('PROCESSING');
      expect(OrderStatus.fromString('SHIPPED').toString()).toBe('SHIPPED');
      expect(OrderStatus.fromString('DELIVERED').toString()).toBe('DELIVERED');
      expect(OrderStatus.fromString('CANCELLED').toString()).toBe('CANCELLED');
    });
  });
});
