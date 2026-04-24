import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { accessJwtConfig } from './config/access-jwt';
import { refreshJwtConfig } from './config/refresh-jwt';
import { AuthGuard } from './guards/auth.guard';
import { RefreshAuthGuard } from './guards/refresh.guard';
import { RolesGuard } from './guards/roles.guard';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule.forFeature(accessJwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    JwtModule.registerAsync(accessJwtConfig.asProvider()),
    DatabaseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, RefreshAuthGuard, RolesGuard],
  exports: [AuthService, AuthGuard, RefreshAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
