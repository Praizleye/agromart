export enum RoleNameType {
  SuperAdmin = 'super_admin',
  Admin = 'admin',
  Aggregator = 'aggregator',
  Logistics = 'logistics',
  User = 'user',
}

export const PROTECTED_ROLES: RoleNameType[] = [
  RoleNameType.SuperAdmin,
  RoleNameType.Admin,
  RoleNameType.Aggregator,
  RoleNameType.Logistics,
];

export const SUPER_ADMIN_INVITABLE: RoleNameType[] = [
  RoleNameType.Admin,
  RoleNameType.Aggregator,
];

export const ADMIN_INVITABLE: RoleNameType[] = [
  RoleNameType.Aggregator,
  RoleNameType.Logistics,
];
