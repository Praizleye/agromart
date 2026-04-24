import { Module } from '@nestjs/common';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from 'src/infrastructure/database/database.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [LogisticsController],
  providers: [LogisticsService],
})
export class LogisticsModule {}
