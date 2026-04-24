import { z } from 'zod';

export const resendVerificationSchema = z
  .object({
    email: z.string().email('Invalid email address'),
  })
  .required();

export type ResendVerificationDto = z.infer<typeof resendVerificationSchema>;
