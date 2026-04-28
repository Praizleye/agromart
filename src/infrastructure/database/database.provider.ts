import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import * as schema from '../persistence/index';
import { Logger } from '@nestjs/common';

export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');
const connectionProvider = {
  provide: DATABASE_CONNECTION,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('DatabaseModule');
    const rawUrl = configService.get<string>('DBConfig.url') as string;
    const normalized = rawUrl.replace(
      /sslmode=(require|prefer|verify-ca)/g,
      'sslmode=verify-full',
    );
    const databaseConfiguration =
      normalized === rawUrl && !rawUrl.includes('sslmode')
        ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}sslmode=verify-full`
        : normalized;

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
