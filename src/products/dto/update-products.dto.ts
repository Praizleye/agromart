import z from 'zod';
import { createProductDto } from './create-product.dto';

export const updateProductDto = createProductDto.partial();

export type UpdateProductDto = z.infer<typeof updateProductDto>;
