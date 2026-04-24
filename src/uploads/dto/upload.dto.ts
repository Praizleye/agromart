import { z } from 'zod';

export const uploadSchema = z.object({
  purpose: z
    .enum(['profile_picture', 'cac_document', 'drivers_license', 'other'])
    .default('other'),
});

export type UploadDto = z.infer<typeof uploadSchema>;
