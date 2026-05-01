import z from "zod";

export const getProductsDto = z.object({
  limit: z.coerce.number().int().positive().default(10),
  offset: z.coerce.number().int().min(0).default(0),
  category_id: z.coerce.number().int().positive().optional(),
  farm_id: z.coerce.number().int().positive().optional(),
  is_available: z.coerce.boolean().optional(),
  unit: z.string().optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  in_stock: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sort_by: z.enum(['price', 'created_at', 'name', 'quantity_in_stock']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
}).refine(
  (data) => {
    if (data.min_price !== undefined && data.max_price !== undefined) {
      return data.min_price <= data.max_price;
    }
    return true;
  },
  { message: 'min_price must be less than or equal to max_price', path: ['min_price'] }
);

export type GetProductsDto = z.infer<typeof getProductsDto>;