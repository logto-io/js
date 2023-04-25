export const config = {
  appId: 'appId', // Replace with your own appId
  appSecret: 'appSecret', // Replace with your own appSecret
  endpoint: 'http://localhost:3001',
  baseUrl: 'http://localhost:3000',
  cookieSecret: 'complex_password_at_least_32_characters_long',
  cookieSecure: process.env.NODE_ENV === 'production',
};
