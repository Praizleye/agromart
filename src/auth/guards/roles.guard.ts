import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleNameType } from '../../interfaces/users/roles.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleNameType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) {
      throw new UnauthorizedException('User role is not defined');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new UnauthorizedException(
        `Role '${user.role}' is not authorized for this resource`,
      );
    }
    return true;
  }
}
