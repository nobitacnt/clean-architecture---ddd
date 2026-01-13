/**
 * Value Object for Order Status
 */
export enum OrderStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class OrderStatus {
  private readonly value: OrderStatusEnum;

  private constructor(value: OrderStatusEnum) {
    this.value = value;
  }

  /**
   * Create a Pending status
   */
  static createPending(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.PENDING);
  }

  /**
   * Create from string value
   */
  static fromString(value: string): OrderStatus {
    const enumValue = OrderStatusEnum[value as keyof typeof OrderStatusEnum];
    if (!enumValue) {
      throw new Error(`Invalid order status: ${value}`);
    }
    return new OrderStatus(enumValue);
  }

  /**
   * Check if order is pending
   */
  isPending(): boolean {
    return this.value === OrderStatusEnum.PENDING;
  }

  /**
   * Check if order is confirmed
   */
  isConfirmed(): boolean {
    return this.value === OrderStatusEnum.CONFIRMED;
  }

  /**
   * Check if order is cancelled
   */
  isCancelled(): boolean {
    return this.value === OrderStatusEnum.CANCELLED;
  }

  /**
   * Check if order is delivered
   */
  isDelivered(): boolean {
    return this.value === OrderStatusEnum.DELIVERED;
  }

  /**
   * Check if status can transition to another status
   */
  canTransitionTo(newStatus: OrderStatus): boolean {
    const transitions: Record<OrderStatusEnum, OrderStatusEnum[]> = {
      [OrderStatusEnum.PENDING]: [
        OrderStatusEnum.CONFIRMED,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.CONFIRMED]: [
        OrderStatusEnum.PROCESSING,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.PROCESSING]: [
        OrderStatusEnum.SHIPPED,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.SHIPPED]: [OrderStatusEnum.DELIVERED],
      [OrderStatusEnum.DELIVERED]: [],
      [OrderStatusEnum.CANCELLED]: [],
    };

    return transitions[this.value].includes(newStatus.value);
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
  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }
}
