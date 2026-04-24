import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  phone: z.string().optional(),
  country_code: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  profile_picture_id: z.number().int().positive().optional(),
});

export type UpdateUserProfileDto = z.infer<typeof updateUserProfileSchema>;
