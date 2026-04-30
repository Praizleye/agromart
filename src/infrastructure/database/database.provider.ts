import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import * as schema from '../persistence/index';
import { Logger } from '@nestjs/common';

export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');

function normalizeDatabaseUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl);

  // Keep sslmode behavior stable across pg upgrades.
  parsed.searchParams.set('uselibpqcompat', 'true');
  parsed.searchParams.set('sslmode', 'require');

  return parsed.toString();
}

const connectionProvider = {
  provide: DATABASE_CONNECTION,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('DatabaseModule');
    const rawUrl = configService.get<string>('DBConfig.url');
    if (!rawUrl) {
      throw new Error('DATABASE_URL is missing. Set DBConfig.url before booting the API.');
    }

    const databaseConfiguration = normalizeDatabaseUrl(rawUrl);

    const pool = new Pool({
      connectionString: databaseConfiguration,
      ssl: { rejectUnauthorized: false },
      allowExitOnIdle: true,
      connectionTimeoutMillis: 72000,
    });
    logger.log(`Database connection established:`);
    return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
  },
};

export default connectionProvider;
