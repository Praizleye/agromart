import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserEventListeners } from './listeners/user-listeners';

@Module({
  imports: [HttpModule],
  providers: [UserEventListeners],
})
export class EventsModule {}
