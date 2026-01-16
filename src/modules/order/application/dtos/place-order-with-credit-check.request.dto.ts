import { z } from 'zod';

export const PlaceOrderWithCreditCheckRequestSchema = z.object({
  customerId: z.string().uuid('Customer ID must be a valid UUID'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        productName: z.string().min(1, 'Product name is required'),
        quantity: z.number().int().positive('Quantity must be positive'),
        price: z.number().positive('Price must be positive'),
      })
    )
    .min(1, 'At least one item is required'),
});

export type PlaceOrderWithCreditCheckRequestDto = z.infer<
  typeof PlaceOrderWithCreditCheckRequestSchema
>;
