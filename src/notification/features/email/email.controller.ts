import { Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  create() {
    return this.emailService.create();
  }

  @Post('send-test')
  send() {
    return this.emailService.send();
  }
}
