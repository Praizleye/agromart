import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';
import path from 'path';

// Get the absolute path to the schemas in nest-lib
const nestLibPath = path.resolve(
  __dirname,
  './src/infrastructure/persistence/schemas',
);

function parseSslOverride(value?: string): 'require' | 'disable' | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on', 'require'].includes(normalized)) {
    return 'require';
  }

  if (['false', '0', 'no', 'off', 'disable'].includes(normalized)) {
    return 'disable';
  }

  return null;
}

function isLocalHostname(hostname: string): boolean {
  return ['localhost', '127.0.0.1', '::1'].includes(hostname);
}

function withSslMode(url: string): string {
  const parsed = new URL(url);
  const configuredSslMode = parsed.searchParams.get('sslmode');
  const sslOverride = parseSslOverride(process.env.DB_SSL);

  const sslMode =
    sslOverride ??
    (configuredSslMode === 'disable' || configuredSslMode === 'require'
      ? configuredSslMode
      : isLocalHostname(parsed.hostname)
        ? 'disable'
        : 'require');

  // Make pg-connection-string semantics explicit across runtime versions.
  parsed.searchParams.set('uselibpqcompat', 'true');
  parsed.searchParams.set('sslmode', sslMode);

  return parsed.toString();
}

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is missing. Set it in your environment before running migrations.',
    );
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
