import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, retry } from 'rxjs';

@Injectable()
export class ZohoService {
  private readonly logger = new Logger(ZohoService.name);
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    // Refresh token if it expires in less than 5 minutes (300,000 ms)
    if (this.accessToken && this.tokenExpiresAt > now + 300000) {
      return this.accessToken as string;
    }

    const clientId = this.configService.getOrThrow<string>('zoho.clientId');
    const clientSecret = this.configService.getOrThrow<string>('zoho.clientSecret');
    const refreshToken = this.configService.getOrThrow<string>('zoho.refreshToken');

    try {
      const response = await firstValueFrom(
        this.httpService
          .post('https://accounts.zoho.com/oauth/v2/token', null, {
            params: {
              refresh_token: refreshToken,
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: 'refresh_token',
            },
          })
          .pipe(retry(3)),
      );

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        // Zoho Tokens usually expire in 3600 seconds (1 hour)
        this.tokenExpiresAt = now + response.data.expires_in * 1000;
        this.logger.log('Successfully refreshed Zoho access token');
        return this.accessToken as string;
      } else {
        throw new Error('No access token returned from Zoho: ' + JSON.stringify(response.data));
      }
    } catch (error: any) {
      this.logger.error('Failed to get Zoho access token', error?.response?.data || error.message);
      throw error;
    }
  }

  async addContactToWaitlistList(
    email: string,
    firstName?: string | null,
    lastName?: string | null,
  ): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      const listKey = this.configService.getOrThrow<string>('zoho.listKey');

      const formData = new URLSearchParams();
      formData.append('resfmt', 'JSON');
      formData.append('listkey', listKey);

      const contactInfo: Record<string, string> = {
        'Contact Email': email,
      };

      if (firstName) {
        contactInfo['First Name'] = firstName;
      }
      if (lastName) {
        contactInfo['Last Name'] = lastName;
      }

      formData.append('contactinfo', JSON.stringify(contactInfo));

      const response = await firstValueFrom(
        this.httpService
          .post('https://campaigns.zoho.com/api/v1.1/json/listsubscribe', formData, {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
          .pipe(retry(3)),
      );

      const responseCode = response.data?.response?.success || response.data?.status;
      if (
        responseCode === 'success' ||
        response.data?.code === 0 ||
        response.data?.status === 'success'
      ) {
        this.logger.log(`Successfully added ${email} to Zoho Campaigns waitlist`);
      } else {
        this.logger.warn(`Zoho Campaigns API responded with: ${JSON.stringify(response.data)}`);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        // Clear cached token if Zoho says it's unauthorized, so next attempt gets a fresh one
        this.accessToken = null;
        this.tokenExpiresAt = 0;
      }
      this.logger.error(
        `Failed to add ${email} to Zoho Campaigns`,
        error?.response?.data || error.message,
      );
      // We don't throw here to prevent blocking the user's waitlist signup flow if Zoho fails
    }
  }
}
