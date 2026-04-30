import { integer, pgTable, serial, text, boolean } from 'drizzle-orm/pg-core';
import { timestamps } from '../../helper/column.helper';
import { products } from './products.schema';
import { files } from './file.schema';

export const productImages = pgTable('product_images', {
  id: serial().primaryKey().notNull(),
  product_id: integer()
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  file_id: integer().notNull().references(() => files.id, { onDelete: 'cascade' }),
  is_default: boolean().notNull().default(false),
  ...timestamps,
});
