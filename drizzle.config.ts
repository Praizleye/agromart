import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';
import path from 'path';

// Get the absolute path to the schemas in nest-lib
const nestLibPath = path.resolve(
  __dirname,
  './src/infrastructure/persistence/schemas',
);

function withSslMode(url: string): string {
  const normalized = url.replace(/sslmode=(require|prefer|verify-ca)/g, 'sslmode=verify-full');
  if (normalized === url && !url.includes('sslmode')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}sslmode=verify-full`;
  }
  return normalized;
}

export default defineConfig({
  schema: `${nestLibPath}/*.schema.ts`,
  dialect: 'postgresql',
  dbCredentials: {
    url: withSslMode(process.env.DATABASE_URL as string),
  },
  out: './src/infrastructure/persistence/migrations',
  migrations: {
    table: 'agromartd',
    schema: 'public',
  },
});
