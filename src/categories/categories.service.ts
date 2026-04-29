import { Inject, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import * as schema from 'src/infrastructure/persistence/index';
import { DATABASE_CONNECTION } from 'src/infrastructure/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaginationDto } from './dto/get-category.dto';
import { id } from 'zod/v4/locales';

@Injectable()
export class CategoriesService {
  constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
        private readonly eventEmitter: EventEmitter2,
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

  async create(dto: CreateCategoryDto, userId: number) {
    const existingCategory = await this.findByCategory(dto.category_name);
    if (existingCategory) {
      throw new Error('Category already exists');
    }
    console.log('Creating category with name:', dto.category_name);
    const [category] = await this.db
      .insert(schema.categories)
      .values({
        name: dto.category_name,
        slug: dto.category_name.toLowerCase().replace(/\s+/g, '-'),
        created_by: userId,
      })
      .returning();

    this.eventEmitter.emit('category.created', {
      id: category.id,
      name: category.name,
      slug: category.slug,
      created_by: category.created_by,
    });

    return {
      message: 'Category created successfully.',
      data: category,
      success: true,
    };
    
  }

  async findAll(dto: PaginationDto) {
    const { page, limit, sort_order } = dto;
    const offset = (page - 1) * limit;

    const [categories, total] = await this.db.transaction(async (tx) => {
      const categories = await tx
        .select({id: schema.categories.id,   name: schema.categories.name })
        .from(schema.categories)
        .orderBy(
          sort_order === 'asc'
            ? asc(schema.categories.created_at)
            : desc(schema.categories.created_at)
        )
        .limit(limit)
        .offset(offset);


      const totalResult = await tx
        .select({ count: sql`count(*)` })
        .from(schema.categories)
        .execute();

      const total = parseInt(totalResult[0].count as string, 10);
      return [categories, total];
    });

    return {
      data: categories,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async remove(id: number) {
    const category = await this.db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
      .execute();

    if (!category.length) {
      throw new Error('Category not found');
    }

    await this.db
      .delete(schema.categories)
      .where(eq(schema.categories.id, id))
      .execute();

    this.eventEmitter.emit('category.deleted', { id });

    return {
      message: 'Category removed successfully.',
      data: category[0],
      success: true,
    };
  }
}
