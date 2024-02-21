import { handleLogto } from '@logto/sveltekit';

import { env } from '$env/dynamic/private';

export const handle = handleLogto(
  {
    endpoint: env.LOGTO_ENDPOINT,
    appId: env.LOGTO_APP_ID,
    appSecret: env.LOGTO_APP_SECRET,
  },
  {
    encryptionKey: env.LOGTO_COOKIE_ENCRYPTION_KEY,
  }
);
