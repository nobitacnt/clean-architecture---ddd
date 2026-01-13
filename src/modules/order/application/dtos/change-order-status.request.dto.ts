import { z } from 'zod';

/**
 * Change Order Status Request DTO Schema
 */
export const ChangeOrderStatusRequestSchema = z.object({
  orderId: z.string().uuid('Order ID must be a valid UUID'),
  newStatus: z.enum(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
});

/**
 * Change Order Status Request DTO Type
 */
export type ChangeOrderStatusRequestDto = z.infer<typeof ChangeOrderStatusRequestSchema>;

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
