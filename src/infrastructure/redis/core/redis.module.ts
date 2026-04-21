import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { RedisOptions } from './redis.provider';
import { RedisService } from '../features/redis.service';

@Global()
@Module({
  imports: [ConfigModule, CacheModule.registerAsync(RedisOptions)],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
