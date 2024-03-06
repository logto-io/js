import LogtoClient, { CookieStorage } from '@logto/node';
import { defineEventHandler } from 'h3';

import { defaults } from '../utils/constants';
import { type LogtoRuntimeConfig } from '../utils/types';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  // eslint-disable-next-line no-restricted-syntax -- Optional fields are not inferred
  const logtoConfig = config.logto as LogtoRuntimeConfig;
  const {
    cookieName,
    cookieEncryptionKey,
    fetchUserInfo,
    pathnames,
    postCallbackRedirectUri,
    postLogoutRedirectUri,
    ...clientConfig
  } = logtoConfig;

  const defaultValueKeys = Object.entries(defaults)
    // @ts-expect-error The type of `key` can only be string
    .filter(([key, value]) => logtoConfig[key] === value)
    .map(([key]) => key);

  if (defaultValueKeys.length > 0) {
    throw new TypeError(
      `The following Logto configuration keys have default values: ${defaultValueKeys.join(
        ', '
      )}. Please replace them with your own values.`
    );
  }

  const url = getRequestURL(event);
  const storage = new CookieStorage(
    {
      cookieKey: cookieName,
      encryptionKey: cookieEncryptionKey,
      getCookie: (name) => getCookie(event, name),
      setCookie: (name, value, options) => {
        setCookie(event, name, value, options);
      },
    },
    { headers: event.headers, url: url.href }
  );

  await storage.init();

  const logto = new LogtoClient(clientConfig, {
    navigate: async (url) => {
      await sendRedirect(event, url, 302);
    },
    storage,
  });

  if (url.pathname === pathnames.signIn) {
    await logto.signIn(new URL(pathnames.callback, url).href);
    return;
  }

  if (url.pathname === pathnames.signOut) {
    await logto.signOut(new URL(postLogoutRedirectUri, url).href);
    return;
  }

  if (url.pathname === pathnames.callback) {
    await logto.handleSignInCallback(url.href);
    await sendRedirect(event, postCallbackRedirectUri, 302);
    return;
  }

  // eslint-disable-next-line @silverhand/fp/no-mutation
  event.context.logtoClient = logto;
  // eslint-disable-next-line @silverhand/fp/no-mutation
  event.context.logtoUser = (await logto.isAuthenticated())
    ? await (fetchUserInfo ? logto.fetchUserInfo() : logto.getIdTokenClaims())
    : undefined;
});
