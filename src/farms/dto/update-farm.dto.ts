import z from 'zod';
import { createFarmDto } from './create-farm.dto';

export const updateFarmDto = createFarmDto.partial();

export type UpdateFarmDto = z.infer<typeof updateFarmDto>;
