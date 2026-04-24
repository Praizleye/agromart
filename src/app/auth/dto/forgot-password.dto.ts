import { z } from 'zod';

export const forgotPasswordSchema = z
  .object({
    email: z.string().email('Invalid email address'),
  })
  .required();

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
