import { z } from 'zod';

export const createProductDto = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description is required'),
  sku: z.string().optional(),
  farm_id: z.number().int().positive('Farm ID must be a positive integer'),
  category_id: z.number().int().positive('Category ID must be a positive integer'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal'),
  quantity_in_stock: z.number().int().min(0).default(0),
  unit: z.string().min(1).default('kg'),
  minimum_order_quantity: z.number().int().positive().default(1).optional(),
  is_available: z.boolean().default(true).optional(),
  file_ids: z.array(z.number().int().positive()).max(5, 'Maximum 5 images allowed').optional(),
});

export type CreateProductDto = z.infer<typeof createProductDto>;