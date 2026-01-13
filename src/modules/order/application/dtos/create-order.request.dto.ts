import { z } from 'zod';

/**
 * Order Item Request DTO Schema
 */
export const OrderItemRequestSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  price: z.number().nonnegative('Price must be non-negative'),
});

/**
 * Create Order Request DTO Schema
 */
export const CreateOrderRequestSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  items: z
    .array(OrderItemRequestSchema)
    .min(1, 'At least one item is required'),
});

/**
 * Create Order Request DTO Type
 */
export type CreateOrderRequestDto = z.infer<typeof CreateOrderRequestSchema>;

/**
 * Order Item Request DTO Type
 */
export type OrderItemRequestDto = z.infer<typeof OrderItemRequestSchema>;
