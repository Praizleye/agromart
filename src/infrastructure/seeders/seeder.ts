import 'dotenv/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../persistence/index';
import { faker } from '@faker-js/faker/locale/en';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

const saltOrRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

const dbSeeder = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;

async function dbSeed() {
  const user = await dbSeeder
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, 'admin@stayer.com'));

  if (user.length > 0) {
    return;
  }

  const hashedPassword = await bcrypt.hash('password', saltOrRounds);

  await dbSeeder.insert(schema.users).values({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    phone: faker.phone.number(),
    email: 'admin@stayer.com',
    is_verified: true,
    password: hashedPassword,
    refresh_token: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as any);
}

dbSeed()
  .then(() => {
    console.log('Database seeded');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
