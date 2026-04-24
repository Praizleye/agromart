import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { R2Module } from '../infrastructure/r2/r2.module';

@Module({
  imports: [AuthModule, DatabaseModule, R2Module],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
