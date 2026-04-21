import { RoleNameType } from './roles.type';

export type JwtPayload = {
  sub: number;
  email: string;
  active_role: RoleNameType;
  roles: {
    id: number;
    role: RoleNameType;
  }[];
};
