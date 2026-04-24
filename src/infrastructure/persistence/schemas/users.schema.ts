import { sql } from 'drizzle-orm';
import {
  AnyPgColumn,
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../../helper/column.helper';

export const appRoleEnum = pgEnum('app_role', [
  'super_admin',
  'admin',
  'aggregator',
  'logistics',
  'user',
]);

export const users = pgTable(
  'users',
  {
    id: serial().primaryKey().notNull(),
    first_name: text().notNull(),
    last_name: text().notNull(),
    email: text().notNull(),
    phone: varchar({ length: 20 }).unique(),
    country_code: varchar({ length: 8 }).default('234'),
    password: varchar({ length: 256 }),
    role: appRoleEnum().notNull().default('user'),
    is_email_verified: boolean().notNull().default(false),
    is_active: boolean().notNull().default(true),
    refresh_token: text(),
    invited_by: integer().references((): AnyPgColumn => users.id, {
      onDelete: 'set null',
    }),
    ...timestamps,
  },
  (table) => [uniqueIndex('users_email_idx').on(sql`lower(${table.email})`)],
);
