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

export const files = pgTable('files', {
  id: serial().primaryKey(),
  user_id: integer()
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  file_key: text().notNull(),
  file_url: text().notNull(),
  file_name: text().notNull(),
  file_type: varchar({ length: 100 }).notNull(),
  file_size: integer().notNull(),
  purpose: filePurposeEnum().default('other').notNull(),
  ...timestamps,
});
