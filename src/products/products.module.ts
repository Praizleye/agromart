import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { FarmsModule } from 'src/farms/farms.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { JwtModule } from '@nestjs/jwt';
import { accessJwtConfig } from 'src/app/auth/config/access-jwt';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { RolesGuard } from 'src/app/auth/guards/roles.guard';
import { AuthGuard } from 'src/app/auth/guards/auth.guard';

@Module({
  imports: [FarmsModule, CategoriesModule,
    JwtModule.registerAsync(accessJwtConfig.asProvider()),
    DatabaseModule],
  controllers: [ProductsController],
  providers: [ProductsService, AuthGuard, RolesGuard],
})
export class ProductsModule {}
