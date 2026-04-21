import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { UserVerificationEventType } from '../event-types/user.event.types';
import { EmailService } from 'src/notification/features/email/email.service'; 
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserEventListeners {
  constructor(
    private readonly emailService: EmailService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent('user.verification')
  async handleUserVerificationEvent(event: UserVerificationEventType) {
    await this.emailService.sendVerifyUserEmail(event);
  }
  @OnEvent('user.welcome')
  async handleWelcomeUser(event: UserVerificationEventType) {
    await this.emailService.sendWelcomeEmail(event);
  }

  @OnEvent('user.verification.whatsapp')
  async handleUserVerificationEventWhatsapp(event: UserVerificationEventType & { token: string }) {
    this.httpService
      .post(`${this.configService.getOrThrow<string>('WHATSAPP_BOT_URL')}/webhook/receive-otp`, {
        otp: event.token,
        phone: event.phone,
        expiry_minutes: '5',
      })
      .subscribe({
        next: (response) => {
          console.log('WhatsApp OTP sent successfully:', response.data);
        },
        error: (error) => {
          console.error('Error sending WhatsApp OTP:', error.response?.data || error.message);
        },
      });
  }
}
