import LogtoClient, { CookieStorage } from '@logto/node';
import { type H3Event, getCookie, sendRedirect, setCookie } from 'h3';
import type { RuntimeConfig } from 'nuxt/schema';

import { type LogtoRuntimeConfig } from './types';

/**
 * Split the Logto runtime config into the module-level options and the configuration consumed by
 * the underlying Logto client.
 */
export const resolveLogtoConfig = (config: RuntimeConfig) => {
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

  return {
    logtoConfig,
    clientConfig,
    cookieName,
    cookieEncryptionKey,
    cookieSecure,
    fetchUserInfo,
    pathnames,
    postCallbackRedirectUri,
    postLogoutRedirectUri,
    customRedirectBaseUrl,
    signInOptions,
  };
};

/**
 * Create a Logto client bound to the current request.
 *
 * The session storage reads from the request cookies and writes to the response cookies, so any
 * session change (a refreshed access token, a cleared session) is persisted before the response is
 * sent. Keeping the client request-scoped also means concurrent requests never share state.
 *
 * When `sessionValueOverride` is given, it replaces the session cookie from the request: a
 * request that was queued behind a concurrent refresh has to continue from the session that
 * refresh minted, because its own cookie still holds a consumed refresh token.
 * `getPersistedSessionValue` reports the cookie value written by the most recent session write,
 * so the caller can share it with requests that still carry the superseded cookie.
 */
export const createLogtoClient = async (
  event: H3Event,
  config: RuntimeConfig,
  sessionValueOverride?: string
) => {
  const { clientConfig, cookieName, cookieEncryptionKey, cookieSecure } =
    resolveLogtoConfig(config);

  // Must match the default `cookieKey` of `CookieStorage`.
  const sessionCookieName = cookieName ?? 'logtoCookies';

  const persistedSession: { value?: string } = {};

  const storage = new CookieStorage({
    cookieKey: cookieName,
    encryptionKey: cookieEncryptionKey,
    isSecure: cookieSecure,
    getCookie: async (name) =>
      name === sessionCookieName && sessionValueOverride !== undefined
        ? sessionValueOverride
        : getCookie(event, name),
    setCookie: async (name, value, options) => {
      if (name === sessionCookieName) {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        persistedSession.value = value;
      }

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

  return { logto, storage, getPersistedSessionValue: () => persistedSession.value };
};
