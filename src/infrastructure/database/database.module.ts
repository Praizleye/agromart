import { Module } from '@nestjs/common';
import connectionProvider, { DATABASE_CONNECTION } from './database.provider';

export { DATABASE_CONNECTION };

@Module({
  providers: [connectionProvider],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
