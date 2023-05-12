export const config = {
  appId: '<app-id>', // Replace with your own appId
  appSecret: '<app-secret>', // Replace with your own appSecret
  endpoint: 'http://localhost:3001',
  baseUrl: 'http://localhost:3000',
  cookieSecret: 'complex_password_at_least_32_characters_long',
  cookieSecure: process.env.NODE_ENV === 'production',
  // Optional fields for RBAC
  // resources: ['http://localhost:3005'],
  // scopes: ['read:users'],
};
