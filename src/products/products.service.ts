import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as schema from 'src/infrastructure/persistence/index';
import { DATABASE_CONNECTION } from 'src/infrastructure/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { asc, desc, eq, sql, and, inArray } from 'drizzle-orm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaginationDto } from 'src/infrastructure/helper/pagination.helper';
import { FarmsService } from 'src/farms/farms.service';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
        private readonly eventEmitter: EventEmitter2,
        private readonly farmsService: FarmsService,
        private readonly categoriesService: CategoriesService
  ) {}

  private async findByProductName(product_name: string) {
    return (
      (
        await this.db
          .select()
          .from(schema.products)
          .where(
            eq(sql`lower(${schema.products.name})`, product_name.toLowerCase()),
          )
      )[0] ?? null
    );
  }

  private async findFilesByIds(file_ids: number[], userId: number) {
      const files = await this.db
        .select()
        .from(schema.files)
        .where(
          and(
            inArray(schema.files.id, file_ids),
            eq(schema.files.user_id, userId)
          )
        );

    return files;
  }

      private generateSku(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        
    .replace(/[^a-z0-9-]/g, ''); 

  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `${base}-${suffix}`;
}

  async create(dto: CreateProductDto, userId: number) {
    const existingProduct = await this.findByProductName(dto.name);
    if (existingProduct) {
      throw new Error('Product with this name already exists');
    }

    const exisitingFarm = await this.farmsService.findFarmById(dto.farm_id);
    if (!exisitingFarm) {
      throw new Error('Farm not found');
    }

    const existingCategory = await this.categoriesService.findByCategoryId(dto.category_id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }

    if (dto.file_ids?.length) {
      const files = await this.findFilesByIds(dto.file_ids, userId);

      if (files.length !== dto.file_ids.length) {
        throw new BadRequestException('One or more file IDs are invalid');
      }
    }
    
    const [product] = await this.db
      .insert(schema.products)
      .values({
        name: dto.name,
        description: dto.description,
        sku: dto.sku ?? this.generateSku(dto.name),
        farm_id: dto.farm_id,
        category_id: dto.category_id,
        price: dto.price,
        quantity_in_stock: dto.quantity_in_stock,
        unit: dto.unit,
        minimum_order_quantity: dto.minimum_order_quantity,
        is_available: dto.is_available,
      })
      .returning();

        if (dto.file_ids?.length) {
      await this.db.insert(schema.productImages).values(
        dto.file_ids.map((file_id, index) => ({
          product_id: product.id,
          file_id,
          is_default: index === 0,
        }))
      );
    }


    this.eventEmitter.emit('product.created', {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      created_by: userId,
    });
    return 'This action adds a new product';
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
