/**
 * Order Item Response DTO
 */
export interface OrderItemResponseDto {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

/**
 * Create Order Response DTO
 */
export interface CreateOrderResponseDto {
  id: string;
  customerId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  message: string;
}

/**
 * Order Response DTO
 */
export interface OrderResponseDto {
  id: string;
  customerId: string;
  items: OrderItemResponseDto[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Orders List Response DTO
 */
export interface OrdersListResponseDto {
  data: OrderResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Change Order Status Response DTO
 */
export interface ChangeOrderStatusResponseDto {
  id: string;
  previousStatus: string;
  newStatus: string;
  updatedAt: string;
  message: string;
}
