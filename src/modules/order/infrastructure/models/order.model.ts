export interface OrderModel {
  id: string;
  customerId: string;
  items: OrderItemModel[];
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemModel {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}
