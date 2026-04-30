import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';
import path from 'path';

// Get the absolute path to the schemas in nest-lib
const nestLibPath = path.resolve(
  __dirname,
  './src/infrastructure/persistence/schemas',
);

function withSslMode(url: string): string {
  const parsed = new URL(url);

  // Make pg-connection-string semantics explicit across runtime versions.
  parsed.searchParams.set('uselibpqcompat', 'true');
  parsed.searchParams.set('sslmode', 'require');

  return parsed.toString();
}

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing. Set it in your environment before running migrations.');
  }

  return withSslMode(databaseUrl);
}

export default defineConfig({
  schema: `${nestLibPath}/*.schema.ts`,
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
  out: './src/infrastructure/persistence/migrations',
  migrations: {
    table: 'agromartd',
    schema: 'public',
  },
});
