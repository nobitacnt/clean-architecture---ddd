import { injectable } from 'inversify';
import { OrderAggregate } from '../aggregates/order.aggregate';

/**
 * Domain Service: Order Placement
 * 
 * - Business logic involves MULTIPLE AGGREGATES (Order + Customer)
 * - Logic doesn't naturally belong to a single aggregate
 * - Complex business rules that span aggregate boundaries
 */
@injectable()
export class OrderPlacementDomainService {
  
  /**
   * Check if customer can place this order based on:
   */
  canPlaceOrder(
    order: OrderAggregate,
    customerCreditLimit: number,
    customerTotalPendingOrders: number,
    customerIsVerified: boolean
  ): { allowed: boolean; reason?: string } {
    
    // Business Rule 1: Check total exposure
    const totalExposure = customerTotalPendingOrders + order.totalAmount;
    
    if (totalExposure > customerCreditLimit) {
      return {
        allowed: false,
        reason: `Total exposure (${totalExposure}) exceeds credit limit (${customerCreditLimit})`
      };
    }

    // Business Rule 2: Unverified customers have order limit
    const UNVERIFIED_CUSTOMER_ORDER_LIMIT = 10000;
    if (!customerIsVerified && order.totalAmount > UNVERIFIED_CUSTOMER_ORDER_LIMIT) {
      return {
        allowed: false,
        reason: `Unverified customers can only place orders up to ${UNVERIFIED_CUSTOMER_ORDER_LIMIT}`
      };
    }

    // Business Rule 3: Check if credit utilization is too high (> 90%)
    const creditUtilization = (totalExposure / customerCreditLimit) * 100;
    const MAX_CREDIT_UTILIZATION = 90;
    
    if (creditUtilization > MAX_CREDIT_UTILIZATION) {
      return {
        allowed: false,
        reason: `Credit utilization (${creditUtilization.toFixed(2)}%) exceeds maximum allowed (${MAX_CREDIT_UTILIZATION}%)`
      };
    }

    return { allowed: true };
  }

  /**
   * Calculate required deposit based on customer risk profile
   * 
   * Another example of cross-aggregate business logic:
   * - Depends on Customer attributes (risk level, history)
   * - Depends on Order attributes (amount, items)
   * - Complex calculation that doesn't belong to either aggregate
   */
  calculateRequiredDeposit(
    orderAmount: number,
    customerRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH',
    customerTotalOrders: number
  ): number {
    
    // New customers (< 5 orders) pay more deposit
    const isNewCustomer = customerTotalOrders < 5;
    
    // Base deposit rates by risk level
    const depositRates = {
      LOW: isNewCustomer ? 0.20 : 0.10,    // 20% or 10%
      MEDIUM: isNewCustomer ? 0.40 : 0.25,  // 40% or 25%
      HIGH: isNewCustomer ? 0.60 : 0.50     // 60% or 50%
    };

    const depositRate = depositRates[customerRiskLevel];
    const deposit = orderAmount * depositRate;

    // Minimum deposit $100
    return Math.max(deposit, 100);
  }

  /**
   * Determine if order needs manual approval
   * 
   * Business logic spanning multiple aggregates:
   * - Order characteristics
   * - Customer history
   * - Business rules
   */
  requiresManualApproval(
    orderAmount: number,
    orderItemsCount: number,
    customerIsVerified: boolean,
    customerAccountAge: number, // in days
    customerTotalOrders: number
  ): boolean {
    
    // Large orders need approval
    const LARGE_ORDER_THRESHOLD = 50000;
    if (orderAmount > LARGE_ORDER_THRESHOLD) {
      return true;
    }

    // Bulk orders need approval
    const BULK_ORDER_THRESHOLD = 100;
    if (orderItemsCount > BULK_ORDER_THRESHOLD) {
      return true;
    }

    // New unverified customers need approval
    const NEW_ACCOUNT_DAYS = 30;
    if (!customerIsVerified && customerAccountAge < NEW_ACCOUNT_DAYS) {
      return true;
    }

    // First order from new customer over $5000 needs approval
    const FIRST_ORDER_REVIEW_THRESHOLD = 5000;
    if (customerTotalOrders === 0 && orderAmount > FIRST_ORDER_REVIEW_THRESHOLD) {
      return true;
    }

    return false;
  }
}
