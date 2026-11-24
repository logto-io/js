import { defineEnvVars } from '@sveltejs/kit/env';

const optionalString = (value?: string): string => value ?? '';

export const variables = defineEnvVars({
  LOGTO_ENDPOINT: { schema: optionalString },
  LOGTO_APP_ID: { schema: optionalString },
  LOGTO_APP_SECRET: { schema: optionalString },
  LOGTO_COOKIE_ENCRYPTION_KEY: { schema: optionalString },
});
