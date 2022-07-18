import LogtoClient from '@logto/next';

export const logtoClient = new LogtoClient({
  appId: 'foo',
  endpoint: 'https://logto.dev',
  baseUrl: 'http://localhost:3000',
  cookieSecret: 'complex_password_at_least_32_characters_long',
  cookieSecure: process.env.NODE_ENV === 'production',
});
