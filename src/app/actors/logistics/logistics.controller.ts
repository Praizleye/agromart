import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { updateLogisticsProfileSchema } from './dto/update-profile.dto';
import type { UpdateLogisticsProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CustomResponseInterceptor } from 'src/interceptors/api-response.interceptor'; 
import { ZodValidationPipe } from 'src/infrastructure/pipeline/validation.pipeline';
import type { JwtPayload } from 'src/interfaces/users/jwt.type';
import { RoleNameType } from 'src/interfaces/users/roles.type';

@Controller('logistics')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleNameType.Logistics)
@UseInterceptors(CustomResponseInterceptor)
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.logisticsService.getProfile(user.sub);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(updateLogisticsProfileSchema)) dto: UpdateLogisticsProfileDto,
  ) {
    return this.logisticsService.updateProfile(user.sub, dto);
  }
}
