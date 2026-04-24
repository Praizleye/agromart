import {
  integer,
  jsonb,
  pgTable,
  serial,
  unique,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../../helper/column.helper';
import { files } from './file.schema';
import { users } from './users.schema';

export const extended_profiles = pgTable('extended_profiles', {
  id: serial().primaryKey(),
  user_id: integer()
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  profile_picture_id: integer().references(() => files.id, {
    onDelete: 'set null',
  }),
  metadata: jsonb().default({}),
  ...timestamps,
});
