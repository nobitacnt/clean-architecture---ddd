import { OrderPlacementDomainService } from '../../../src/modules/order/domain/services/order-placement-domain.service';
import { OrderAggregate } from '../../../src/modules/order/domain/aggregates/order.aggregate';

describe('OrderPlacementDomainService', () => {
  let service: OrderPlacementDomainService;

  beforeEach(() => {
    service = new OrderPlacementDomainService();
  });

  describe('canPlaceOrder', () => {
    const createTestOrder = (amount: number) => {
      return OrderAggregate.create('customer-123', [
        {
          productId: 'product-1',
          productName: 'Test Product',
          quantity: 1,
          price: amount,
        },
      ]);
    };

    it('should allow order when within credit limit', () => {
      const order = createTestOrder(10000);
      const result = service.canPlaceOrder(
        order,
        100000, // credit limit
        20000,  // pending orders
        true    // verified
      );

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject order when total exposure exceeds credit limit', () => {
      const order = createTestOrder(50000);
      const result = service.canPlaceOrder(
        order,
        100000, // credit limit
        60000,  // pending orders (60k + 50k = 110k > 100k)
        true
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('exceeds credit limit');
    });

    it('should reject large orders from unverified customers', () => {
      const order = createTestOrder(15000);
      const result = service.canPlaceOrder(
        order,
        100000,
        0,
        false // unverified customer
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Unverified customers');
    });

    it('should allow small orders from unverified customers', () => {
      const order = createTestOrder(5000);
      const result = service.canPlaceOrder(
        order,
        100000,
        0,
        false
      );

      expect(result.allowed).toBe(true);
    });

    it('should reject when credit utilization > 90%', () => {
      const order = createTestOrder(20000);
      const result = service.canPlaceOrder(
        order,
        100000, // credit limit
        75000,  // pending (75k + 20k = 95k = 95% utilization)
        true
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Credit utilization');
    });
  });

  describe('calculateRequiredDeposit', () => {
    it('should calculate deposit for low-risk existing customer', () => {
      const deposit = service.calculateRequiredDeposit(
        10000,  // order amount
        'LOW',  // risk level
        10      // total orders (existing customer)
      );

      expect(deposit).toBe(1000); // 10% of 10000
    });

    it('should calculate higher deposit for low-risk new customer', () => {
      const deposit = service.calculateRequiredDeposit(
        10000,
        'LOW',
        3 // new customer (< 5 orders)
      );

      expect(deposit).toBe(2000); // 20% of 10000
    });

    it('should calculate deposit for high-risk customer', () => {
      const deposit = service.calculateRequiredDeposit(
        10000,
        'HIGH',
        10
      );

      expect(deposit).toBe(5000); // 50% of 10000
    });

    it('should enforce minimum deposit of $100', () => {
      const deposit = service.calculateRequiredDeposit(
        100,   // small order
        'LOW',
        10
      );

      expect(deposit).toBe(100); // minimum $100
    });

    it('should calculate deposit for medium-risk new customer', () => {
      const deposit = service.calculateRequiredDeposit(
        10000,
        'MEDIUM',
        2
      );

      expect(deposit).toBe(4000); // 40% of 10000
    });
  });

  describe('requiresManualApproval', () => {
    it('should require approval for large orders', () => {
      const requiresApproval = service.requiresManualApproval(
        60000,  // large order
        10,
        true,
        100,
        5
      );

      expect(requiresApproval).toBe(true);
    });

    it('should require approval for bulk orders', () => {
      const requiresApproval = service.requiresManualApproval(
        10000,
        150,  // bulk order (> 100 items)
        true,
        100,
        5
      );

      expect(requiresApproval).toBe(true);
    });

    it('should require approval for new unverified customers', () => {
      const requiresApproval = service.requiresManualApproval(
        5000,
        10,
        false, // unverified
        15,    // new account (< 30 days)
        0
      );

      expect(requiresApproval).toBe(true);
    });

    it('should require approval for first large order', () => {
      const requiresApproval = service.requiresManualApproval(
        6000,  // > $5000
        10,
        true,
        100,
        0      // first order
      );

      expect(requiresApproval).toBe(true);
    });

    it('should not require approval for normal orders', () => {
      const requiresApproval = service.requiresManualApproval(
        3000,  // normal amount
        10,    // normal quantity
        true,  // verified
        100,   // established account
        5      // existing customer
      );

      expect(requiresApproval).toBe(false);
    });
  });
});
