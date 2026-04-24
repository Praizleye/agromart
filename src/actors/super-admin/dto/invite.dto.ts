import { z } from 'zod';
import { RoleNameType, SUPER_ADMIN_INVITABLE } from '../../../interfaces/users/roles.type';

export const superAdminInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(
    SUPER_ADMIN_INVITABLE as [RoleNameType, ...RoleNameType[]],
    { error: `Role must be one of: ${SUPER_ADMIN_INVITABLE.join(', ')}` }
  ),
});

export type SuperAdminInviteDto = z.infer<typeof superAdminInviteSchema>;
