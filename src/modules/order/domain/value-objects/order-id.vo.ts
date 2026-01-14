import { UuidUtil } from '@/shared/common/utils/uuid';

/**
 * Value Object for Order ID
 */
export class OrderId {
  private readonly value: string;

  private constructor(value: string) {
    UuidUtil.validateOrThrow(value, 'OrderId');
    this.value = value;
  }

  /**
   * Create a new Order ID
   */
  static create(): OrderId {
    return new OrderId(UuidUtil.generate());
  }

  /**
   * Create from existing ID
   */
  static fromString(value: string): OrderId {
    return new OrderId(value);
  }

  /**
   * Get the string value
   */
  toString(): string {
    return this.value;
  }

  /**
   * Check equality
   */
  equals(other: OrderId): boolean {
    return this.value === other.value;
  }
}
