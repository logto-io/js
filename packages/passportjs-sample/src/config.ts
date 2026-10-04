const appId = process.env.APP_ID;

if (!appId) {
  throw new Error('APP_ID is not set');
}

const appSecret = process.env.APP_SECRET;

if (!appSecret) {
  throw new Error('APP_SECRET is not set');
}

const endpoint = process.env.ENDPOINT;

if (!endpoint) {
  throw new Error('ENDPOINT is not set');
}

const cookieSecret = process.env.COOKIE_SECRET ?? 'keyboard cat';

export const config = {
  appId,
  appSecret,
  endpoint,
  cookieSecret,
};
