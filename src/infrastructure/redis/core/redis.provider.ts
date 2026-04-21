import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import KeyvRedis, { RedisClientOptions } from '@keyv/redis';
import { Logger } from '@nestjs/common';

export const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('Redis');
    const environment = configService.get<string>('NODE_ENV') || 'development';
    logger.log(`Current environment: ${environment}`);

    // In-memory cache as primary/fallback store
    const memoryStore = new Keyv({
      store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
    });

    // Try to configure Redis, but gracefully fall back to memory-only if unavailable
    const redisHost = configService.get<string>('REDIS_HOST');
    const redisPassword = configService.get<string>('REDIS_PASSWORD');
    const redisPort = configService.get<string>('REDIS_PORT');

    if (!redisHost || !redisPassword) {
      logger.warn('Redis configuration missing. Running with in-memory cache only.');
      return { stores: [memoryStore] };
    }

    logger.log(`Using Redis host: ${redisHost}`);

    try {
      const redisConfig = {
        password: redisPassword,
        socket: {
          host: redisHost,
          port: parseInt(redisPort || '6379', 10),
          reconnectStrategy: (retries: number) => {
            if (retries > 3) {
              logger.warn(`Redis reconnect failed after ${retries} attempts. Using memory cache.`);
              return false; // Stop reconnecting after 3 attempts
            }
            return Math.min(retries * 50, 2000);
          },
          connectTimeout: 5000, // 5 second timeout
          keepAlive: 60000,
        },
      };

      const keyvRedisInstance = new Keyv(
        new KeyvRedis(redisConfig as unknown as RedisClientOptions),
      );

      keyvRedisInstance.on('error', (err) => {
        logger.error(`Redis connection error: ${err.message}`);
        // Don't throw - allow fallback to memory cache
      });

      keyvRedisInstance.on('connect', () => {
        logger.log('Redis connection successful');
      });

      keyvRedisInstance.on('end', () => {
        logger.warn('Redis connection closed');
      });

      keyvRedisInstance.namespace = 'albatross-redis';

      return {
        stores: [memoryStore, keyvRedisInstance],
      };
    } catch (error: any) {
      logger.error(`Failed to initialize Redis: ${error.message}`);
      logger.warn('Falling back to in-memory cache only.');
      return { stores: [memoryStore] };
    }
  },
  inject: [ConfigService],
};
