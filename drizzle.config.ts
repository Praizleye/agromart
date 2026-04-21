import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';
import path from 'path';

// Get the absolute path to the schemas in nest-lib
const nestLibPath = path.resolve(
  __dirname,
  './src/infrastructure/persistence/schemas',
);

export default defineConfig({
  schema: `${nestLibPath}/*.schema.ts`,
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  out: './src/infrastructure/persistence/migrations',
  migrations: {
    table: 'agromartd',
    schema: 'public',
  },
});
