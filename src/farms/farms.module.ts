import { Module } from '@nestjs/common';
import { FarmsService } from './farms.service';
import { FarmsController } from './farms.controller';
import { JwtModule } from '@nestjs/jwt';
import { accessJwtConfig } from 'src/app/auth/config/access-jwt';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { AuthGuard, RolesGuard } from 'src/app/auth';

@Module({
  imports: [
    JwtModule.registerAsync(accessJwtConfig.asProvider()),
    DatabaseModule,
  ],
  controllers: [FarmsController],
  providers: [FarmsService, AuthGuard, RolesGuard],
  exports: [FarmsService],
})
export class FarmsModule {}
