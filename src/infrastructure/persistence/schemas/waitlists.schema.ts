import { varchar, pgTable, pgEnum, serial, uniqueIndex, text, jsonb } from 'drizzle-orm/pg-core';
import { timestamps } from '../../helper/column.helper';

import { createInsertSchema } from 'drizzle-zod';
import { appRoleEnum, lower } from './users.schema';

export const waitlistStatusEnum = pgEnum('waitlist_status', ['pending', 'invited', 'joined']);

export const waitlists = pgTable(
  'waitlists',
  {
    id: serial('id').primaryKey().notNull(),

    email: varchar('email', { length: 255 }).notNull().unique(),
    first_name: varchar('first_name', { length: 100 }),
    last_name: varchar('last_name', { length: 100 }),

    interested_role: appRoleEnum('interested_role'),

    suggested_feature: text('suggested_feature'),

    status: waitlistStatusEnum('status').notNull().default('pending'),

    referral_code: varchar('referral_code', { length: 50 }).unique().notNull(),
    referred_by_code: varchar('referred_by_code', { length: 50 }),
    phone: varchar('phone', { length: 20 }),

    metadata: jsonb('metadata'),

    ...timestamps,
  },
  (table) => [
    uniqueIndex('waitlist_email_idx').on(lower(table.email)),
    uniqueIndex('waitlist_referral_idx').on(table.referral_code),
  ],
);

export const waitlistInsertSchema = createInsertSchema(waitlists);
