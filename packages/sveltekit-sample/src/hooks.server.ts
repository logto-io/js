import { handleLogto } from '@logto/sveltekit';

import {
  LOGTO_APP_ID,
  LOGTO_APP_SECRET,
  LOGTO_COOKIE_ENCRYPTION_KEY,
  LOGTO_ENDPOINT,
} from '$app/env/private';

export const handle = handleLogto(
  {
    endpoint: LOGTO_ENDPOINT,
    appId: LOGTO_APP_ID,
    appSecret: LOGTO_APP_SECRET,
  },
  {
    encryptionKey: LOGTO_COOKIE_ENCRYPTION_KEY,
  }
);
