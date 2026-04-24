import { z } from 'zod';

export const updateLogisticsProfileSchema = z.object({
  vehicle_type: z.string().optional(),
  plate_number: z.string().optional(),
  license_number: z.string().optional(),
  license_document_id: z.number().int().positive().optional(),
  profile_picture_id: z.number().int().positive().optional(),
});

export type UpdateLogisticsProfileDto = z.infer<
  typeof updateLogisticsProfileSchema
>;
