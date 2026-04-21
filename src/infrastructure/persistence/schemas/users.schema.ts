import {
  varchar,
  pgTable,
  pgEnum,
  serial,
  boolean,
  uniqueIndex,
  integer,
  AnyPgColumn,
  jsonb,
  timestamp,
  unique,
  text,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../../helper/column.helper';
import { SQL, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const appRoleEnum = pgEnum('app_role', [
  'tenant',
  'landlord',
  'agent',
  'admin',
  'super_admin',
]);

export const kycStatusEnum = pgEnum('kyc_status', [
  'unverified',
  'pending',
  'verified',
  'rejected',
]);

export const users = pgTable(
  'users',
  {
    id: serial().primaryKey().notNull(),
    first_name: text().notNull(),
    last_name: text().notNull(),
    phone: varchar('phone', { length: 20 }).unique(),
    countryCode: varchar('country_code', { length: 8 }).default('234'),
    email: text().notNull(),
    password: varchar('password', { length: 256 }),
    is_email_verified: boolean().notNull().default(false),
    is_phone_verified: boolean().notNull().default(false),
    google_id: text(),
    refresh_token: text(),
    ...timestamps,
  },
  (table) => [uniqueIndex('email_idx').on(lower(table.email))],
);

export const users_settings = pgTable(
  'users_settings',
  {
    id: serial().primaryKey(),
    user_id: integer()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    profile_pic: text(),
    locale: varchar('locale', { length: 10 }).default('en-US'),
    notifications: jsonb().default({ email: true, push: true }),
    updated_at: timestamp().defaultNow(),
  },
  (table) => [unique('uq_user_settings_user_id').on(table.user_id)],
);

export const user_roles = pgTable(
  'user_roles',
  {
    id: serial().primaryKey(),
    user_id: integer()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: appRoleEnum().notNull(),
    status: kycStatusEnum().notNull().default('unverified'),
    ...timestamps,
  },
  (table) => [unique('uq_user_id_role').on(table.user_id, table.role)],
);

export const role_kyc = pgTable(
  'role_kyc',
  {
    id: serial().primaryKey(),
    user_role_id: integer()
      .notNull()
      .references(() => user_roles.id, { onDelete: 'cascade' }),
    submission_data: jsonb().notNull(),
    admin_notes: text(),
    submitted_at: timestamp().defaultNow().notNull(),
    reviewed_at: timestamp(),
  },
  (table) => [unique('uq_role_kyc_role_id').on(table.user_role_id)],
);

export const userKycTypeEnum = pgEnum('user_kyc_type', ['identity', 'face']);

export const user_kyc = pgTable(
  'user_kyc',
  {
    id: serial().primaryKey(),
    user_id: integer()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kyc_type: userKycTypeEnum().notNull(),
    submission_data: jsonb().notNull(),
    status: kycStatusEnum().notNull().default('unverified'),
    admin_notes: text(),
    submitted_at: timestamp().defaultNow().notNull(),
    reviewed_at: timestamp(),
  },
  (table) => [unique('uq_user_kyc_user_type').on(table.user_id, table.kyc_type)],
);

export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

export const userInsertSchema = createInsertSchema(users);
