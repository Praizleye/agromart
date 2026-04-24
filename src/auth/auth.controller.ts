import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { completeInviteSchema } from './dto/complete-invite.dto';
import { forgotPasswordSchema } from './dto/forgot-password.dto';
import { loginSchema } from './dto/login.dto';
import { registerSchema } from './dto/register.dto';
import { resendVerificationSchema } from './dto/resend-verification.dto';
import { resetPasswordSchema } from './dto/reset-password.dto';
import { verifyEmailSchema } from './dto/verify-email.dto';
import { AuthGuard } from './guards/auth.guard';
import { RefreshAuthGuard } from './guards/refresh.guard';
import { CustomResponseInterceptor } from '../interceptors/api-response.interceptor';
import { ZodValidationPipe } from '../infrastructure/pipeline/validation.pipeline';
import type { JwtPayload } from '../interfaces/users/jwt.type';

@Controller('auth')
@UseInterceptors(CustomResponseInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  register(@Body() dto: any) {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  @UsePipes(new ZodValidationPipe(verifyEmailSchema))
  verifyEmail(@Body() dto: any) {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verification')
  @UsePipes(new ZodValidationPipe(resendVerificationSchema))
  resendVerification(@Body() dto: any) {
    return this.authService.resendVerification(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginSchema))
  login(@Body() dto: any) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  forgotPassword(@Body() dto: any) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  resetPassword(@Body() dto: any) {
    return this.authService.resetPassword(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshAuthGuard)
  refreshTokens(@CurrentUser() user: JwtPayload & { token: string }) {
    return this.authService.refreshTokens(user.token);
  }

  @Post('complete-invite')
  @UsePipes(new ZodValidationPipe(completeInviteSchema))
  completeInvite(@Body() dto: any) {
    return this.authService.completeInvite(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.sub);
  }
}
