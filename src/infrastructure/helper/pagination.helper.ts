import { z } from 'zod';

export const paginationDto = z
  .object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().default(10),
    sort_order: z.enum(['asc', 'desc']).default('asc'),
  })
  .required();

export type PaginationDto = z.infer<typeof paginationDto>;
