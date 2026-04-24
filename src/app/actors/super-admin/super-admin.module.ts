import { Module } from '@nestjs/common';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { InvitationsModule } from 'src/invitations/invitations.module';

@Module({
  imports: [AuthModule, DatabaseModule, InvitationsModule],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
})
export class SuperAdminModule {}
