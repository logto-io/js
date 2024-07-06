import LogtoClient, { CookieStorage } from '@logto/node';
import { trySafe } from '@silverhand/essentials';
import { defineEventHandler, getRequestURL, getCookie, setCookie, sendRedirect } from 'h3';

import { defaults } from '../utils/constants';
import { type LogtoRuntimeConfig } from '../utils/types';

import { useRuntimeConfig } from '#imports';

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
    baseUrlOverride,
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

  const requestUrl = getRequestURL(event);

  // Use the baseUrlOverride if provided, otherwise use the request URL
  const baseUrl = baseUrlOverride ? new URL(baseUrlOverride) : requestUrl;

  const storage = new CookieStorage(
    {
      cookieKey: cookieName,
      encryptionKey: cookieEncryptionKey,
      getCookie: (name) => getCookie(event, name),
      setCookie: (name, value, options) => {
        setCookie(event, name, value, options);
      },
    },
    { headers: event.headers, url: baseUrl.href }
  );

  await storage.init();

  const logto = new LogtoClient(clientConfig, {
    navigate: async (url) => {
      await sendRedirect(event, url, 302);
    },
    storage,
  });

  if (requestUrl.pathname === pathnames.signIn) {
    await logto.signIn(new URL(pathnames.callback, baseUrl).href);
    return;
  }

  if (requestUrl.pathname === pathnames.signOut) {
    await logto.signOut(new URL(postLogoutRedirectUri, baseUrl).href);
    return;
  }

  if (requestUrl.pathname === pathnames.callback) {
    // Use the baseUrl for the callback, but keep the original query parameters
    const callbackUrl = new URL(requestUrl.pathname + requestUrl.search, baseUrl);
    await logto.handleSignInCallback(callbackUrl.href);
    await sendRedirect(event, postCallbackRedirectUri, 302);
    return;
  }

  // eslint-disable-next-line @silverhand/fp/no-mutation
  event.context.logtoClient = logto;
  // eslint-disable-next-line @silverhand/fp/no-mutation
  event.context.logtoUser = (await logto.isAuthenticated())
    ? await trySafe(async () => (fetchUserInfo ? logto.fetchUserInfo() : logto.getIdTokenClaims()))
    : undefined;
});
