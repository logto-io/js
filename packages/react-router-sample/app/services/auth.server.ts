import { makeLogtoReactRouter } from '@logto/react-router';
import { createCookieSessionStorage } from 'react-router';

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'logto-session',
    maxAge: 14 * 24 * 60 * 60,
    // Remember to change this secret in production
    secrets: [process.env.SESSION_SECRET ?? 'secr3tSession'],
  },
});

if (!process.env.LOGTO_ENDPOINT || !process.env.LOGTO_APP_ID || !process.env.LOGTO_APP_SECRET) {
  throw new Error('Missing Logto environment variables');
}

export const logto = makeLogtoReactRouter(
  {
    endpoint: process.env.LOGTO_ENDPOINT,
    appId: process.env.LOGTO_APP_ID,
    appSecret: process.env.LOGTO_APP_SECRET,
    baseUrl: process.env.LOGTO_BASE_URL ?? 'http://localhost:5173',
  },
  { sessionStorage }
);
