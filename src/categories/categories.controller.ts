import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { createCategoryDto } from './dto/create-category.dto';
import { ZodValidationPipe } from 'src/infrastructure/pipeline/validation.pipeline';
import { AuthGuard, CurrentUser, Roles, RolesGuard } from 'src/app/auth';
import { RoleNameType } from 'src/interfaces/users';
import type { JwtPayload } from 'src/interfaces/users/jwt.type';
import { CustomResponseInterceptor } from 'src/interceptors/api-response.interceptor';
import { paginationDto } from 'src/infrastructure/helper/pagination.helper';

@Controller('categories')
@UseInterceptors(CustomResponseInterceptor)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleNameType.Admin)  
  @UsePipes(new ZodValidationPipe(createCategoryDto))
  create(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.categoriesService.create(dto, user.sub);
  }

  @Get()
  @UsePipes(new ZodValidationPipe(paginationDto))
  findAll(@Body() dto: any) {
    return this.categoriesService.findAll(dto);
  }

  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleNameType.Admin)   
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
