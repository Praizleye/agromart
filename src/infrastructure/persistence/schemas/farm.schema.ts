import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { timestamps } from '../../helper/column.helper';

export const farms = pgTable('farms', {
  id: serial().primaryKey().notNull(),
  name: text().notNull(),
  description: text(),
  address: text().notNull(),
  phone: varchar({ length: 20 }).notNull(),
  email: text(),
  ...timestamps,
});
