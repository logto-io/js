import { UserScope } from '@logto/next';

export const logtoConfig = {
  appId: process.env.APP_ID ?? '<app-id>',
  appSecret: process.env.APP_SECRET ?? '<app-secret>',
  endpoint: process.env.ENDPOINT ?? 'http://localhost:3001',
  baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',
  cookieSecret: process.env.COOKIE_SECRET ?? 'complex_password_at_least_32_characters_long',
  cookieSecure: process.env.NODE_ENV === 'production',
  // Optional fields for RBAC
  resources: process.env.RESOURCES?.split(','),
  scopes: process.env.SCOPES?.split(',') ?? [UserScope.Organizations, UserScope.OrganizationRoles],
};
