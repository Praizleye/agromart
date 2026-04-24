import { RoleNameType } from './roles.type';

export type JwtPayload = {
  sub: number;
  email: string;
  role: RoleNameType;
};
