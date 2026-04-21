import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailTemplateService } from '../../core/email';

@Global()
@Module({
  // imports: [MailerModule],
  controllers: [EmailController],
  providers: [EmailService, EmailTemplateService],
  exports: [EmailService],
})
export class EmailModule {}
