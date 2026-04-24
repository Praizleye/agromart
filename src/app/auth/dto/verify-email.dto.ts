import { z } from 'zod';

export const verifyEmailSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    token: z.string().min(1, 'Token is required'),
  })
  .required();

export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
