import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    token: z.string().min(1, 'Token is required'),
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .required();

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
