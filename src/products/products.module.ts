import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { FarmsModule } from 'src/farms/farms.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [FarmsModule, CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
