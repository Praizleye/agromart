import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return AuthGuard.getUserFromRequest(request);
  },
);
