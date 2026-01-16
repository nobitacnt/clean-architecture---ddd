import { z } from 'zod';

export const CreateCustomerRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  creditLimit: z.number().positive().optional().default(100000),
});

export type CreateCustomerRequestDto = z.infer<typeof CreateCustomerRequestSchema>;
