import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import * as schema from 'src/infrastructure/persistence/index';
import { DATABASE_CONNECTION } from 'src/infrastructure/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { asc, desc, eq, sql, and, inArray, SQL, gte, lte, gt, or, ilike } from 'drizzle-orm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FarmsService } from 'src/farms/farms.service';
import { CategoriesService } from 'src/categories/categories.service';
import { GetProductsDto } from './dto/get-product.dto';
import { UpdateProductDto } from './dto/update-products.dto';

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
      throw new BadRequestException('Product with this name already exists');
    }

    const exisitingFarm = await this.farmsService.findFarmById(dto.farm_id);
    if (!exisitingFarm) {
      throw new BadRequestException('Farm not found');
    }

    const existingCategory = await this.categoriesService.findByCategoryId(dto.category_id);
    if (!existingCategory) {
      throw new BadRequestException('Category not found');
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
    
    return {
      message: 'Product created successfully.',
      data: product,
      success: true,
    };
  }

  async findAll(dto: GetProductsDto) {
    const {
    limit, offset, category_id, farm_id, is_available,
    unit, min_price, max_price, in_stock, search, sort_by, sort_order,
  } = dto;

  const conditions: SQL[] = [];
  
  if (category_id) conditions.push(eq(schema.products.category_id, category_id));
  if (farm_id) conditions.push(eq(schema.products.farm_id, farm_id));
  if (is_available !== undefined) conditions.push(eq(schema.products.is_available, is_available));
  if (unit) conditions.push(eq(schema.products.unit, unit));
  if (min_price !== undefined) conditions.push(gte(schema.products.price, String(min_price)));
  if (max_price !== undefined) conditions.push(lte(schema.products.price, String(max_price)));
  if (in_stock) conditions.push(gt(schema.products.quantity_in_stock, 0));
  if (search) {
    const searchCondition = or(
      ilike(schema.products.name, `%${search}%`),
      ilike(schema.products.description, `%${search}%`),
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  const orderColumn = {
    price: schema.products.price,
    created_at: schema.products.created_at,
    name: schema.products.name,
    quantity_in_stock: schema.products.quantity_in_stock,
  }[sort_by];

  const products = await this.db
    .select()
    .from(schema.products)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(sort_order === 'asc' ? asc(orderColumn) : desc(orderColumn))
    .limit(limit)
    .offset(offset);

  return {
    data: products,
    meta: { limit, offset, count: products.length },
  };
  }

async findOne(id: number) {
  const product = await this.db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, id))
    .then((result) => result[0] ?? null);

  if (!product) {
    throw new NotFoundException(`Product with ID ${id} not found`);
  }

  const images = await this.db
    .select()
    .from(schema.productImages)
    .leftJoin(schema.files, eq(schema.productImages.file_id, schema.files.id))
    .where(eq(schema.productImages.product_id, id));

  return { ...product, images };
}

async update(id: number, dto: UpdateProductDto) {
  const product = await this.findOne(id);

  if (!product) {
    throw new NotFoundException(`Product with ID ${id} not found`);
  }

  const { file_ids, ...productData } = dto;

  return await this.db.transaction(async (tx) => {
    const [updated] = await tx
      .update(schema.products)
      .set({
        ...productData,
        ...(productData.name && !dto.sku && { sku: this.generateSku(productData.name) }),
      })
      .where(eq(schema.products.id, id))
      .returning();

    if (file_ids?.length) {
      const files = await tx
        .select()
        .from(schema.files)
        .where(inArray(schema.files.id, file_ids));

      if (files.length !== file_ids.length) {
        throw new BadRequestException('One or more file IDs are invalid');
      }

      await tx
        .delete(schema.productImages)
        .where(eq(schema.productImages.product_id, id));

      await tx.insert(schema.productImages).values(
        file_ids.map((file_id, index) => ({
          product_id: id,
          file_id,
          is_default: index === 0,
        })),
      );
    }

    return updated;
  });
}

  async remove(id: number) {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.db.delete(schema.products).where(eq(schema.products.id, id));

    return { message: `Product with ID ${id} deleted successfully` };
  }
}
