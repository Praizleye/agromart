import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(key: string): Promise<any> {
    try {
      return await this.cacheManager.get(key);
    } catch (error: any) {
      this.logger.warn(`Cache get failed for key "${key}": ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error: any) {
      this.logger.warn(`Cache set failed for key "${key}": ${error.message}`);
      // Don't throw - allow app to continue without caching
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error: any) {
      this.logger.warn(`Cache delete failed for key "${key}": ${error.message}`);
      // Don't throw - allow app to continue
    }
  }

  async ping(): Promise<string> {
    try {
      // Try to set and get a test key
      await this.set('ping', 'pong', 1000);
      const result = await this.get('ping');
      return result === 'pong' ? 'PONG' : 'FAIL';
    } catch (error) {
      this.logger.error('Redis Ping Error:', error);
      return 'FAIL';
    }
  }
}
