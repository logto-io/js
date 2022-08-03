import LogtoClient from '@logto/next';

export const logtoClient = new LogtoClient({
  appId: 'foo-traditional',
  appSecret: 'TXxxky90RxGNFeStfP2xv--ZhsPoz9VGRn5PDbEI1iAACGZp6R_IN0iigujq42V5',
  endpoint: 'https://logto.dev',
  baseUrl: 'http://localhost:3000',
  cookieSecret: 'complex_password_at_least_32_characters_long',
  cookieSecure: process.env.NODE_ENV === 'production',
});
