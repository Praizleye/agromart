import { z } from 'zod';

export const completeInviteSchema = z
  .object({
    token: z.string().min(1, 'Invite token is required'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().optional(),
    country_code: z.string().default('234').optional(),
  })
  .required();

export type CompleteInviteDto = z.infer<typeof completeInviteSchema>;
