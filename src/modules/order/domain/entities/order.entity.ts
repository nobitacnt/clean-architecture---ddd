import { OrderId } from '../value-objects/order-id.vo';
import { OrderStatus } from '../value-objects/order-status.vo';

/**
 * Order Entity
 * Represents an order in the system
 */
export interface OrderSchema {
  id: OrderId;
  customerId: string;
  items: OrderItemSchema[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemSchema {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export class OrderEntity {
  private readonly props: OrderSchema;

  constructor(props: OrderSchema) {
    this.props = props;
  }

  /**
   * Create a new order
   */
  static create(
    customerId: string,
    items: OrderItemSchema[]
  ): OrderEntity {
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return new OrderEntity({
      id: OrderId.create(),
      customerId,
      items,
      totalAmount,
      status: OrderStatus.createPending(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Reconstitute from persistence
   */
  static fromPersistence(props: OrderSchema): OrderEntity {
    return new OrderEntity(props);
  }

  // Getters
  get id(): OrderId {
    return this.props.id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get items(): OrderItemSchema[] {
    return [...this.props.items];
  }

  get totalAmount(): number {
    return this.props.totalAmount;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Update the order status
   */
  updateStatus(newStatus: OrderStatus): void {
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  /**
   * Convert to plain object
   */
  toObject() {
    return {
      id: this.id.toString(),
      customerId: this.customerId,
      items: this.items,
      totalAmount: this.totalAmount,
      status: this.status.toString(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
