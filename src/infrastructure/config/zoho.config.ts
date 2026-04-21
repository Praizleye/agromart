import { registerAs } from '@nestjs/config';

export const zohoConfig = registerAs('zoho', () => ({
  clientId: process.env.ZOHO_CLIENT_ID,
  clientSecret: process.env.ZOHO_CLIENT_SECRET,
  refreshToken: process.env.ZOHO_REFRESH_TOKEN,
  listKey: process.env.ZOHO_CONTACT_LIST_KEY,
}));
