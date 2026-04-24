import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { superAdminInviteSchema } from './dto/invite.dto';
import type { SuperAdminInviteDto } from './dto/invite.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CustomResponseInterceptor } from '../../interceptors/api-response.interceptor';
import { ZodValidationPipe } from '../../infrastructure/pipeline/validation.pipeline';
import type { JwtPayload } from '../../interfaces/users/jwt.type';
import { RoleNameType } from '../../interfaces/users/roles.type';

@Controller('super-admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleNameType.SuperAdmin)
@UseInterceptors(CustomResponseInterceptor)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  invite(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(superAdminInviteSchema)) dto: SuperAdminInviteDto,
  ) {
    return this.superAdminService.invite(user, dto);
  }

  @Get('admins')
  listAdmins() {
    return this.superAdminService.listByRole('admin' as any);
  }

  @Get('aggregators')
  listAggregators() {
    return this.superAdminService.listByRole('aggregator' as any);
  }

  @Get('logistics')
  listLogistics() {
    return this.superAdminService.listByRole('logistics' as any);
  }

  @Get('users')
  listUsers() {
    return this.superAdminService.listByRole('user' as any);
  }
}
