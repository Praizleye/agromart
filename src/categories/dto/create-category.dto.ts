import { z } from 'zod';

export const createCategoryDto = z
  .object({
    category_name: z.string().min(1, 'Name is required'),})
  .required();

export type CreateCategoryDto = z.infer<typeof createCategoryDto>;