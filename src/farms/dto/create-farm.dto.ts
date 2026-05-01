import { z } from 'zod';

export const createFarmDto = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .max(20, 'Phone must be 20 characters or less'),
  email: z.string().email('Invalid email').optional(),
});

export type CreateFarmDto = z.infer<typeof createFarmDto>;
