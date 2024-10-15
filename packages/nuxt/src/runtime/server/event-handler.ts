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
    cookieSecure,
    fetchUserInfo,
    pathnames,
    postCallbackRedirectUri,
    postLogoutRedirectUri,
    customRedirectBaseUrl,
    signInOptions,
    ...clientConfig
  } = logtoConfig;

  const defaultValueKeys = Object.entries(defaults)
    // @ts-expect-error The type of `key` can only be string
    .filter(([key, value]) => logtoConfig[key] === value)
    .map(([key]) => key);

  if (defaultValueKeys.length > 0) {
    console.warn(
      `The following Logto configuration keys have default values: ${defaultValueKeys.join(
        ', '
      )}. Please replace them with your own values.`
    );
  }

  const requestUrl = getRequestURL(event);

  /**
   * This approach allows us to:
   * 1. Override the base URL when necessary (e.g., in proxy environments)
   * 2. Preserve the original path and query parameters
   * 3. Fall back to the original URL when no custom base is provided
   *
   * It's particularly useful in scenarios where the application is deployed
   * behind a reverse proxy or in environments that rewrite URLs.
   */
  const url = customRedirectBaseUrl
    ? new URL(requestUrl.pathname + requestUrl.search + requestUrl.hash, customRedirectBaseUrl)
    : requestUrl;

  const storage = new CookieStorage({
    cookieKey: cookieName,
    encryptionKey: cookieEncryptionKey,
    isSecure: cookieSecure,
    getCookie: (name) => getCookie(event, name),
    setCookie: (name, value, options) => {
      setCookie(event, name, value, options);
    },
  });

  await storage.init();

  const logto = new LogtoClient(clientConfig, {
    navigate: async (url) => {
      await sendRedirect(event, url, 302);
    },
    storage,
  });

  if (url.pathname === pathnames.signIn) {
    await logto.signIn({
      ...signInOptions,
      redirectUri: new URL(pathnames.callback, url).href,
    });
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
    ? await trySafe(async () => (fetchUserInfo ? logto.fetchUserInfo() : logto.getIdTokenClaims()))
    : undefined;
});
