import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const email_verification = pgTable('email_verification', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  expires_at: timestamp('expires_at').defaultNow(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
