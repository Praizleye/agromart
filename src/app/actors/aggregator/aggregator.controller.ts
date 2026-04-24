import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AggregatorService } from './aggregator.service';
import { updateAggregatorProfileSchema } from './dto/update-profile.dto';
import type { UpdateAggregatorProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CustomResponseInterceptor } from 'src/interceptors/api-response.interceptor';
import { ZodValidationPipe } from 'src/infrastructure/pipeline/validation.pipeline';
import type { JwtPayload } from 'src/interfaces/users/jwt.type';
import { RoleNameType } from 'src/interfaces/users/roles.type';

@Controller('aggregator')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleNameType.Aggregator)
@UseInterceptors(CustomResponseInterceptor)
export class AggregatorController {
  constructor(private readonly aggregatorService: AggregatorService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.aggregatorService.getProfile(user.sub);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(updateAggregatorProfileSchema)) dto: UpdateAggregatorProfileDto,
  ) {
    return this.aggregatorService.updateProfile(user.sub, dto);
  }
}
