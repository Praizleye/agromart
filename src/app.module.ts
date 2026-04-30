import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './app/auth';
import { SuperAdminModule } from './app/actors/super-admin/super-admin.module';
import { AdminModule } from './app/actors/admin/admin.module';
import { AggregatorModule } from './app/actors/aggregator/aggregator.module';
import { LogisticsModule } from './app/actors/logistics/logistics.module';
import { UserModule } from './app/actors/user/user.module';
import { InvitationsModule } from './invitations/invitations.module';
import { UploadsModule } from './uploads/uploads.module';
import { EventsModule } from './events/events.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { databaseConfig } from './infrastructure/config/database.config';
import { EmailModule } from './notification/features/email/email.module';
import { CategoriesModule } from './categories/categories.module';
import { FarmsModule } from './farms/farms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env'],
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    LoggerModule,
    EmailModule,
    EventsModule,
    AuthModule,
    InvitationsModule,
    SuperAdminModule,
    AdminModule,
    AggregatorModule,
    LogisticsModule,
    UserModule,
    UploadsModule,
    CategoriesModule,
    FarmsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
