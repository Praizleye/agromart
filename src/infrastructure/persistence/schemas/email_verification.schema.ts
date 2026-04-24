import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const email_verification = pgTable('email_verification', {
  id: serial().primaryKey(),
  user_id: integer().references(() => users.id, { onDelete: 'cascade' }),
  token: text().notNull(),
  expires_at: timestamp(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
