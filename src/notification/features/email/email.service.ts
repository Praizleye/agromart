import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import * as path from 'path';
import { EmailTemplateService } from '../../core/email';

export interface IUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
}

@Injectable()
export class EmailService {
  private partialsRegistered = false;
  private readonly templateBasePath: string;

  constructor(private email: EmailTemplateService) {
    this.templateBasePath = this.resolveTemplateBasePath();
    // Register partials when the service is instantiated
    this.registerPartials();
  }

  private resolveTemplateBasePath(): string {
    return path.resolve(__dirname, '..', '..', '..', '..', 'assets', 'views');
  }

  private registerPartials() {
    if (this.partialsRegistered) return;

    try {
      const partialsDir = path.join(this.templateBasePath, 'partials');

      const headerPath = path.join(partialsDir, 'header.hbs');
      const footerPath = path.join(partialsDir, 'footer.hbs');

      // Check if files exist before trying to read them
      if (fs.existsSync(headerPath)) {
        const headerContent = fs.readFileSync(headerPath, 'utf8');
        Handlebars.registerPartial('header', headerContent);
        console.log('✅ Header partial registered successfully');
      } else {
        console.warn('⚠️ Header partial not found at:', headerPath);
      }

      if (fs.existsSync(footerPath)) {
        const footerContent = fs.readFileSync(footerPath, 'utf8');
        Handlebars.registerPartial('footer', footerContent);
        console.log('✅ Footer partial registered successfully');
      } else {
        console.warn('⚠️ Footer partial not found at:', footerPath);
      }

      this.partialsRegistered = true;
    } catch (error) {
      console.error('❌ Error registering partials:', error);
    }
  }

  private renderHtmlTemplates = (template: string, data: any) => {
    // Ensure partials are registered before rendering
    this.registerPartials();

    const filePath = path.join(this.templateBasePath, `${template}.hbs`);

    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Template file not found: ${filePath}`);
      }

      const source = fs.readFileSync(filePath, 'utf8');
      Handlebars.registerHelper('splitToken', function (token) {
        return token ? token.split('') : [];
      });
      const handleBarsTemplate = Handlebars.compile(source);
      return handleBarsTemplate(data);
    } catch (error) {
      console.error(`❌ Error rendering template ${template}:`, error);
      throw error;
    }
  };

  // ... rest of your methods remain the same
  create() {
    this.email.sendEmailTemplate({
      to: 'praiseleye.pl@gmail.com',
      subject: 'Test',
      html: this.renderHtmlTemplates('welcome-user', {
        first_name: 'test',
        token: '084565',
      }),
    });
    return 'This action adds a new email';
  }

  async sendVerifyUserEmail(
    sendVerifyUserEmailDto: IUser & { token?: string },
  ) {
    console.log(
      '🚀 ~ EmailService ~ sendVerifyUserEmailDto:',
      sendVerifyUserEmailDto,
    );
    await this.email.sendEmailTemplate({
      to: sendVerifyUserEmailDto.email,
      subject: 'Verify your email',
      html: this.renderHtmlTemplates('verify-user', {
        ...sendVerifyUserEmailDto,
      }),
    });
  }

  async sendWelcomeEmail(user: IUser) {
    await this.email.sendEmailTemplate({
      to: user.email,
      subject: 'Welcome to Agromart',
      html: this.renderHtmlTemplates('welcome-user', {
        first_name: user.first_name,
      }),
    });
  }

  async sendWaitlistWelcomeEmail(user: IUser & { referral_code: string }) {
    await this.email.sendEmailTemplate({
      to: user.email,
      subject: "You're on the waitlist!",
      html: this.renderHtmlTemplates('waitlist-welcome', {
        first_name: user.first_name,
        referral_code: user.referral_code,
      }),
    });
  }

  @OnEvent('user.forgot-password')
  async sendForgotPasswordEmail(user: IUser & { token: string }) {
    await this.email.sendEmailTemplate({
      to: user.email,
      subject: 'Reset your password',
      html: this.renderHtmlTemplates('forgot-password', {
        ...user,
      }),
    });
  }

  send() {
    this.email.sendEmailTemplate({
      to: ['goodnessjohn156@gmail.com'],
      subject: 'Test',
      html: this.renderHtmlTemplates('welcome-user', {
        first_name: 'test',
        token: '084565',
      }),
    });
    return 'This action adds a new email';
  }
}
