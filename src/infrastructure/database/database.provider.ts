import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import * as schema from '../persistence/index';
import { Logger } from '@nestjs/common';

export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');

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

function getDatabaseSslMode(parsedUrl: URL): 'require' | 'disable' {
  const configuredSslMode = parsedUrl.searchParams.get('sslmode');
  const sslOverride = parseSslOverride(process.env.DB_SSL);

  if (sslOverride) {
    return sslOverride;
  }

  if (configuredSslMode === 'require' || configuredSslMode === 'disable') {
    return configuredSslMode;
  }

  return isLocalHostname(parsedUrl.hostname) ? 'disable' : 'require';
}

function normalizeDatabaseUrl(rawUrl: string): {
  connectionString: string;
  sslMode: 'require' | 'disable';
} {
  const parsed = new URL(rawUrl);
  const sslMode = getDatabaseSslMode(parsed);

  // Keep sslmode behavior stable across pg upgrades.
  parsed.searchParams.set('uselibpqcompat', 'true');
  parsed.searchParams.set('sslmode', sslMode);

  return { connectionString: parsed.toString(), sslMode };
}

const connectionProvider = {
  provide: DATABASE_CONNECTION,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const logger = new Logger('DatabaseModule');
    const rawUrl = configService.get<string>('DBConfig.url');
    if (!rawUrl) {
      throw new Error(
        'DATABASE_URL is missing. Set DBConfig.url before booting the API.',
      );
    }

    const databaseConfiguration = normalizeDatabaseUrl(rawUrl);

    const pool = new Pool({
      connectionString: databaseConfiguration.connectionString,
      ssl:
        databaseConfiguration.sslMode === 'require'
          ? { rejectUnauthorized: false }
          : false,
      allowExitOnIdle: true,
      connectionTimeoutMillis: 72000,
    });
    logger.log(`Database connection established:`);
    return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
  },
};

export default connectionProvider;
