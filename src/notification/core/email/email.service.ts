import { Injectable, Logger } from '@nestjs/common';
import { SendMailClient } from 'zeptomail';
import { ConfigService } from '@nestjs/config';

interface EmailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

@Injectable()
export class EmailTemplateService {
  private readonly client: SendMailClient;
  private isEmailConfigured: boolean = false;
  private readonly fromAddress: string;
  private readonly fromName: string;
  private readonly logger = new Logger(EmailTemplateService.name);

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('ZEPTO_API_URL');
    // console.log("🚀 ~ EmailTemplateService ~ constructor ~ url:", url)
    const token = this.configService.get<string>('ZEPTO_API_TOKEN');
    // console.log("🚀 ~ EmailTemplateService ~ constructor ~ token:", token)
    this.fromAddress =
      this.configService.get<string>('ZEPTO_FROM_ADDRESS') ||
      'Agromarttech.com';
    this.fromName =
      this.configService.get<string>('ZEPTO_FROM_NAME') || 'AgromartTech';

    // Check if email is properly configured
    if (!url || !token) {
      this.logger.warn(
        'Email service not configured. Missing ZEPTO_API_URL or ZEPTO_API_TOKEN. Emails will not be sent.',
      );
      this.isEmailConfigured = false;
      return;
    }

    // Log configuration (without token)
    this.logger.log(
      `Email config - URL: ${url}, From: ${this.fromName} <${this.fromAddress}>`,
    );

    this.client = new SendMailClient({ url, token });
    this.isEmailConfigured = true;

    this.logger.log('✅ ZeptoMail client initialized successfully');
  }

  async sendEmailTemplate(payload: EmailPayload) {
    // Check if email is configured
    if (!this.isEmailConfigured) {
      this.logger.warn(
        'Email service not configured. Email not sent to:',
        payload.to,
      );
      return false;
    }

    // Validate email addresses
    if (!payload.to || (Array.isArray(payload.to) && payload.to.length === 0)) {
      this.logger.error('No recipient email address provided');
      return false;
    }

    // Retry logic
    const maxRetries = 2;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`Sending email attempt ${attempt}/${maxRetries}`);

        // Convert payload to ZeptoMail format
        const toAddresses = Array.isArray(payload.to)
          ? payload.to
          : [payload.to];

        const zeptoPayload = {
          from: {
            address: this.fromAddress,
            name: this.fromName,
          },
          to: toAddresses.map((email) => ({
            email_address: {
              address: email,
              name: email.split('@')[0], // Use email username as name
            },
          })),
          subject: payload.subject,
          ...(payload.html && { htmlbody: payload.html }),
          ...(payload.text && { textbody: payload.text }),
        };

        await this.client.sendMail(zeptoPayload);

        const recipients =
          typeof payload.to === 'string' ? payload.to : payload.to.join(', ');
        this.logger.log(`✅ Email sent successfully to ${recipients}`);
        return true;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `❌ Email attempt ${attempt}/${maxRetries} failed:`,
          error.message,
        );

        // Don't retry on auth errors
        if (error.code === 'EAUTH' || error.response?.status === 401) {
          this.logger.error('🔑 Email authentication failed. Check API token.');
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          this.logger.debug(`Waiting ${waitTime}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed
    this.logger.error(
      '❌ EmailTemplateService ~ sendEmailTemplate ~ all attempts failed',
      lastError,
    );

    // Provide more detailed error information
    if (lastError.response) {
      this.logger.error(
        `⚠️ ZeptoMail API Error: ${lastError.response.status} - ${lastError.response.statusText}`,
      );
      this.logger.error('Response data:', lastError.response.data);
    } else if (lastError.code === 'ETIMEDOUT') {
      this.logger.error(
        '⏱️ Email API connection timeout. Check network connectivity.',
      );
    } else if (lastError.code === 'ECONNREFUSED') {
      this.logger.error('� Email API connection refused. Check API URL.');
    }

    return false;
  }
}
