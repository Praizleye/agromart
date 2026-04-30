import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { createProductDto } from './dto/create-product.dto';
import type { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard, CurrentUser, Roles, RolesGuard } from 'src/app/auth';
import { RoleNameType } from 'src/interfaces/users';
import type { JwtPayload } from 'src/interfaces/users';
import { ZodValidationPipe } from 'src/infrastructure/pipeline/validation.pipeline';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard) //, RolesGuard
  // @Roles(RoleNameType.Admin)  
  @UsePipes(new ZodValidationPipe(createProductDto))  
  create(@Body() dto: CreateProductDto, @CurrentUser() user: JwtPayload) {
    return this.productsService.create(dto, user.sub);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
