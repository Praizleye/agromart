import { Inject, Injectable } from '@nestjs/common';
import { CreateFarmDto } from './dto/create-farm.dto';
import { DATABASE_CONNECTION } from 'src/infrastructure/database/database.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as schema from 'src/infrastructure/persistence/index';
import { asc, desc, and, eq, sql } from 'drizzle-orm';
import { PaginationDto } from 'src/infrastructure/helper/pagination.helper';
import { describe } from 'zod/v4/core';
import { UpdateFarmDto } from './dto/update-farm.dto';

@Injectable()
export class FarmsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async findDuplicateFarm(dto: CreateFarmDto) {
    return (
      (
        await this.db
          .select()
          .from(schema.farms)
          .where(
            and(
              eq(sql`lower(${schema.farms.name})`, dto.name.toLowerCase()),
              eq(
                sql`lower(${schema.farms.description})`,
                dto.description?.toLowerCase() ?? null,
              ),
              eq(
                sql`lower(${schema.farms.address})`,
                dto.address.toLowerCase(),
              ),
              eq(sql`lower(${schema.farms.phone})`, dto.phone),
              eq(
                sql`lower(${schema.farms.email})`,
                dto.email?.toLowerCase() ?? null,
              ),
            ),
          )
      )[0] ?? null
    );
  }

  private async findById(id: number) {
    return (
      (
        await this.db.select().from(schema.farms).where(eq(schema.farms.id, id))
      )[0] ?? null
    );
  }

  async create(dto: CreateFarmDto, user_id: number) {
    const duplicateFarm = await this.findDuplicateFarm(dto);
    if (duplicateFarm) {
      throw new Error('Possible duplicate data');
    }
    const [farm] = await this.db
      .insert(schema.farms)
      .values({
        name: dto.name,
        description: dto.description,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
      })
      .returning();

    this.eventEmitter.emit('farm.created', {
      id: farm.id,
      name: farm.name,
      description: farm.description,
      address: farm.address,
      phone: farm.phone,
      email: farm.email,
      created_by: user_id,
    });

    return {
      message: 'Farm created successfully.',
      data: farm,
      success: true,
    };
  }

  async findAll(dto: PaginationDto) {
    const { page, limit, sort_order } = dto;
    const offset = (page - 1) * limit;

    const [farms, total] = await this.db.transaction(async (tx) => {
      const farms = await tx
        .select({
          id: schema.farms.id,
          name: schema.farms.name,
          description: schema.farms.description,
          address: schema.farms.address,
          phone: schema.farms.phone,
          email: schema.farms.email,
        })
        .from(schema.farms)
        .orderBy(
          sort_order === 'asc'
            ? asc(schema.farms.created_at)
            : desc(schema.farms.created_at),
        )
        .limit(limit)
        .offset(offset);

      const totalResult = await tx
        .select({ count: sql`count(*)` })
        .from(schema.farms)
        .execute();

      const total = parseInt(totalResult[0].count as string, 10);
      return [farms, total];
    });

    return {
      data: farms,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
      success: true,
    };
  }

  async findOne(id: number) {
    const farm = await this.db
      .select()
      .from(schema.farms)
      .where(eq(schema.farms.id, id))
      .limit(1)
      .execute()
      .then((result) => result[0] ?? null);

    if (!farm) {
      throw new Error('Farm not found');
    }

    return {
      data: farm,
      success: true,
    };
  }

  async update(id: number, dto: UpdateFarmDto) {
    const farm = await this.findById(id);
    if (!farm) {
      throw new Error('Farm not found');
    }
    const [updatedFarm] = await this.db
      .update(schema.farms)
      .set(dto)
      .where(eq(schema.farms.id, id))
      .returning();

      this.eventEmitter.emit('farm.updated', {
        id: updatedFarm.id,
        name: updatedFarm.name,
        description: updatedFarm.description,
        address: updatedFarm.address,
        phone: updatedFarm.phone,
        email: updatedFarm.email,
      });

    return {
      message: 'Farm updated successfully.',
      data: updatedFarm,
      success: true,
    };
  }

  async remove(id: number) {
    const farm = await this.findById(id);
    if (!farm) {
      throw new Error('Farm not found');
    }
    await this.db
    .delete(schema.farms)
    .where(eq(schema.farms.id, id))
    .execute();

    this.eventEmitter.emit('farm.deleted', {
      id: farm.id,
      name: farm.name,
      description: farm.description,
      address: farm.address,
      phone: farm.phone,
      email: farm.email,
    });

    return {
      message: 'Farm removed successfully.',
      data: farm,
      success: true,
    };
  }
}
