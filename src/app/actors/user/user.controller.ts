import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { updateUserProfileSchema } from './dto/update-profile.dto';
import type { UpdateUserProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CustomResponseInterceptor } from 'src/interceptors/api-response.interceptor';
import { ZodValidationPipe } from 'src/infrastructure/pipeline/validation.pipeline';
import type { JwtPayload } from 'src/interfaces/users/jwt.type';
import { RoleNameType } from 'src/interfaces/users/roles.type';

@Controller('user')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleNameType.User)
@UseInterceptors(CustomResponseInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.getProfile(user.sub);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(updateUserProfileSchema)) dto: UpdateUserProfileDto,
  ) {
    return this.userService.updateProfile(user.sub, dto);
  }
}
