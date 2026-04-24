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
import { AdminService } from './admin.service';
import { adminInviteSchema } from './dto/invite.dto';
import type { AdminInviteDto } from './dto/invite.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CustomResponseInterceptor } from '../../interceptors/api-response.interceptor';
import { ZodValidationPipe } from '../../infrastructure/pipeline/validation.pipeline';
import type { JwtPayload } from '../../interfaces/users/jwt.type';
import { RoleNameType } from '../../interfaces/users/roles.type';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleNameType.Admin)
@UseInterceptors(CustomResponseInterceptor)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  invite(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(adminInviteSchema)) dto: AdminInviteDto,
  ) {
    return this.adminService.invite(user, dto);
  }

  @Get('aggregators')
  listAggregators() {
    return this.adminService.listByRole('aggregator' as any);
  }

  @Get('logistics')
  listLogistics() {
    return this.adminService.listByRole('logistics' as any);
  }
}
