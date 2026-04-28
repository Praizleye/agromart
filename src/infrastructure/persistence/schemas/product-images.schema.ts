import { integer, pgTable, serial, text, boolean } from 'drizzle-orm/pg-core';
import { timestamps } from '../../helper/column.helper';
import { products } from './products.schema';

export const productImages = pgTable('product_images', {
  id: serial().primaryKey().notNull(),
  product_id: integer()
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  image_url: text().notNull(),
  is_default: boolean().notNull().default(false),
  ...timestamps,
});
