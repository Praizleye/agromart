import { z } from 'zod';

export const updateAggregatorProfileSchema = z.object({
  business_name: z.string().min(1).optional(),
  business_address: z.string().min(1).optional(),
  cac_number: z.string().min(1).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  cac_document_id: z.number().int().positive().optional(),
  profile_picture_id: z.number().int().positive().optional(),
});

export type UpdateAggregatorProfileDto = z.infer<
  typeof updateAggregatorProfileSchema
>;
