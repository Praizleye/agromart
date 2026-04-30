import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { AuthGuard, RolesGuard } from 'src/app/auth';
import { JwtModule } from '@nestjs/jwt';
import { accessJwtConfig } from 'src/app/auth/config/access-jwt';

@Module({
  imports: [
        JwtModule.registerAsync(accessJwtConfig.asProvider()),
    DatabaseModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, AuthGuard, RolesGuard],
  exports: [CategoriesService],
})
export class CategoriesModule {}
