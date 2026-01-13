import { z } from 'zod';

/**
 * Get Order Request DTO Schema
 */
export const GetOrderRequestSchema = z.object({
  orderId: z.string().uuid('Order ID must be a valid UUID'),
});

/**
 * Get Order Request DTO Type
 */
export type GetOrderRequestDto = z.infer<typeof GetOrderRequestSchema>;

/**
 * Get Orders List Request DTO Schema
 */
export const GetOrdersListRequestSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

/**
 * Get Orders List Request DTO Type
 */
export type GetOrdersListRequestDto = z.infer<typeof GetOrdersListRequestSchema>;
