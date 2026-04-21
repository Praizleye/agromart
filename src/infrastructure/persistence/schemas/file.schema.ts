import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../../helper/column.helper';
import { users, user_roles } from './users.schema';

export const file = pgTable('file', {
  id: serial('id').primaryKey().notNull(),
  file_url: text('file_url').notNull(),
  file_type: varchar('file_type', { length: 255 }).notNull(),
  file_purpose: varchar('file_purpose', { length: 255 }).notNull(),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role_id: integer('role_id')
    .references(() => user_roles.id, { onDelete: 'set null' }),
  ...timestamps,
});
