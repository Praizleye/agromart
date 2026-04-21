import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { EmailModule } from './notification/features/email/email.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { databaseConfig } from './infrastructure/config/database.config';
import { zohoConfig } from './infrastructure/config/zoho.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, zohoConfig],
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    EventEmitterModule.forRoot(),
    LoggerModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
