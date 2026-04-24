import { sql } from 'drizzle-orm';
import { AnyPgColumn, timestamp } from 'drizzle-orm/pg-core';

export const lower = (col: AnyPgColumn) => sql<string>`lower(${col})`;

export const timestamps = {
  updated_at: timestamp().defaultNow(),
  created_at: timestamp().defaultNow().notNull(),
  deleted_at: timestamp(),
};
