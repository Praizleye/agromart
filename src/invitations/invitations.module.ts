import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { DatabaseModule } from '../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
