import {
  integer,
  pgTable,
  serial,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../../helper/column.helper';
import { users } from './users.schema';

export const categories = pgTable(
  'categories',
  {
    id: serial().primaryKey().notNull(),
    name: text().notNull().unique(),
    slug: text().notNull().unique(),
    created_by: integer().references(() => users.id, { onDelete: 'cascade' }),
    // icon_url: text(),
    ...timestamps,
  },
  (table) => [uniqueIndex('categories_slug_idx').on(table.slug)],
);
