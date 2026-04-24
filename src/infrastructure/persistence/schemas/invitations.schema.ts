import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../../helper/column.helper';
import { appRoleEnum, users } from './users.schema';

export const inviteStatusEnum = pgEnum('invite_status', [
  'pending',
  'accepted',
  'expired',
]);

export const invitations = pgTable('invitations', {
  id: serial().primaryKey(),
  email: text().notNull(),
  role: appRoleEnum().notNull(),
  token: text().notNull().unique(),
  invited_by: integer()
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  status: inviteStatusEnum().default('pending').notNull(),
  expires_at: timestamp().notNull(),
  ...timestamps,
});
