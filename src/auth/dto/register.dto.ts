import { z } from 'zod';

export const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    country_code: z.string().default('234').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .required();

export type RegisterDto = z.infer<typeof registerSchema>;
