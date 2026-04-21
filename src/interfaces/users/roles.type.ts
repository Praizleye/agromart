export enum RoleNameType {
  Tenant = 'tenant',
  Landlord = 'landlord',
  Agent = 'agent',
  Admin = 'admin',
  Super_admin = 'super_admin',
}

/** Roles that cannot be self-assigned — users must be invited */
export const PROTECTED_ROLES: RoleNameType[] = [
  RoleNameType.Admin,
  RoleNameType.Super_admin,
];

export type RoleReturned = {
  id: string;
  name: RoleNameType;
  description?: string;
  created_at: Date;
  updated_at: Date;
};
