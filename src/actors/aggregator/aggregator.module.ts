import { Module } from '@nestjs/common';
import { AggregatorController } from './aggregator.controller';
import { AggregatorService } from './aggregator.service';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [AggregatorController],
  providers: [AggregatorService],
})
export class AggregatorModule {}
