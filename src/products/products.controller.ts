import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { createProductDto } from './dto/create-product.dto';
import type { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard, CurrentUser, Roles, RolesGuard } from 'src/app/auth';
import { RoleNameType } from 'src/interfaces/users';
import type { JwtPayload } from 'src/interfaces/users';
import { ZodValidationPipe } from 'src/infrastructure/pipeline/validation.pipeline';
import { getProductsDto } from './dto/get-product.dto';
import type { GetProductsDto } from './dto/get-product.dto';
import { updateProductDto, type UpdateProductDto } from './dto/update-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleNameType.Admin)  
  @UsePipes(new ZodValidationPipe(createProductDto))  
  create(@Body() dto: CreateProductDto, @CurrentUser() user: JwtPayload) {
    return this.productsService.create(dto, user.sub);
  }

  @Get()  
  @UsePipes(new ZodValidationPipe(getProductsDto))  
  findAll(@Query() dto: GetProductsDto) {
    return this.productsService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleNameType.Admin)    
  @UsePipes(new ZodValidationPipe(updateProductDto))
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleNameType.Admin)    
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
