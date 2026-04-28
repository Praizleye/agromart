import {
  integer,
  pgTable,
  serial,
  text,
  decimal,
  boolean,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../../helper/column.helper';
import { farms } from './farm.schema';
import { categories } from './categories.schema';

export const products = pgTable('products', {
  id: serial().primaryKey().notNull(),
  name: text().notNull(),
  description: text(),
  sku: text().unique(),
  farm_id: integer()
    .notNull()
    .references(() => farms.id, { onDelete: 'cascade' }),
  category_id: integer()
    .notNull()
    .references(() => categories.id, { onDelete: 'restrict' }),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  quantity_in_stock: integer().notNull().default(0),
  unit: text().notNull().default('kg'), // kg, liter, piece, etc.
  minimum_order_quantity: integer().default(1),
  is_available: boolean().notNull().default(true),
  ...timestamps,
});
