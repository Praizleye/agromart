import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { InvitationsModule } from 'src/invitations/invitations.module';

@Module({
  imports: [AuthModule, DatabaseModule, InvitationsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
