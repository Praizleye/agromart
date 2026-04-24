import { z } from 'zod';
import { RoleNameType, ADMIN_INVITABLE } from '../../../interfaces/users/roles.type';

export const adminInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(
    ADMIN_INVITABLE as [RoleNameType, ...RoleNameType[]],
    { error: `Role must be one of: ${ADMIN_INVITABLE.join(', ')}` }
  ),
});

export type AdminInviteDto = z.infer<typeof adminInviteSchema>;
