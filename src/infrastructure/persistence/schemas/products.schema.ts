import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  varchar,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../../helper/column.helper';
import { users } from './users.schema';

export const filePurposeEnum = pgEnum('file_purpose', [
  'profile_picture',
  'cac_document',
  'drivers_license',
  'other',
]);

export const products = pgTable('products', {
  id: serial().primaryKey(),
  user_id: integer()
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text().notNull(),
  description: text(),
  price: integer().notNull(),
  quantity: integer().notNull(),
  category: varchar({ length: 100 }),
  ...timestamps,
});
