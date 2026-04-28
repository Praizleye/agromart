import { Inject, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import * as schema from 'src/infrastructure/persistence/index';
import { DATABASE_CONNECTION } from 'src/infrastructure/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, desc, eq, sql } from 'drizzle-orm';

@Injectable()
export class CategoriesService {
  constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  private async findByCategory(category: string) {
    return (
      (
        await this.db
          .select()
          .from(schema.categories)
          .where(eq(sql`lower(${schema.categories.name})`, category.toLowerCase()))
      )[0] ?? null
    );
  }

  async create(dto: CreateCategoryDto) {
    const existingCategory = await this.findByCategory(dto.category_name);
    if (existingCategory) {
      throw new Error('Category already exists');
    }
    console.log('Creating category with name:', dto.category_name);
    return 'This action adds a new category';
  }



  // findAll() {
  //   return `This action returns all categories`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} category`;
  // }

  // update(id: number, updateCategoryDto: UpdateCategoryDto) {
  //   return `This action updates a #${id} category`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} category`;
  // }
}
