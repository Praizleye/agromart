import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { createCategoryDto, CreateCategoryDto } from './dto/create-category.dto';
import { ZodValidationPipe } from 'src/infrastructure/pipeline/validation.pipeline';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('create')
  @UsePipes(new ZodValidationPipe(createCategoryDto))
  create(@Body() dto: any) {
    return this.categoriesService.create(dto);
  }

  // @Get()
  // findAll() {
  //   return this.categoriesService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.categoriesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
  //   return this.categoriesService.update(+id, updateCategoryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.categoriesService.remove(+id);
  // }
}
