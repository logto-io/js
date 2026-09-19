import { type default as LogtoClient, LogtoClientError, LogtoRequestError } from '@logto/node';
import { trySafe } from '@silverhand/essentials';
import { createError, type H3Event, getCookie, getQuery, setResponseHeader } from 'h3';
import type { RuntimeConfig } from 'nuxt/schema';

import { createLogtoClient, resolveLogtoConfig } from './client';
import { NotAuthenticatedErrorCode } from './constants';
import {
  getRotatedSessionValue,
  recordRotatedSessionValue,
  runSessionExclusive,
} from './session-coordination';

export type AccessTokenQuery = {
  resource?: string;
  organizationId?: string;
};

export type AccessTokenResponse = {
  accessToken: string;
};

/**
 * The OAuth 2.0 error codes that mean the stored session can no longer be renewed, so the only way
 * forward is a new sign-in.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6749#section-5.2}
 */
const unrecoverableRefreshErrorCodes = new Set(['invalid_grant']);

const throwNotAuthenticated = (): never => {
  throw createError({
    statusCode: 401,
    statusMessage: 'Unauthorized',
    data: { code: NotAuthenticatedErrorCode },
  });
};

/**
 * Answer a client-side access token request.
 *
 * Requests that share a session are serialized: refresh token rotation invalidates a refresh
 * token once it is used, so parallel requests refreshing with the same token would trip reuse
 * detection and sign the user out. A queued request adopts the session value minted by the
 * request that just ran instead of trusting its now-stale cookie.
 */
export const handleAccessTokenRequest = async (event: H3Event, config: RuntimeConfig) => {
  const { cookieName } = resolveLogtoConfig(config);
  const query = getQuery<AccessTokenQuery>(event);
  // Must match the default `cookieKey` of `CookieStorage`.
  const requestSessionValue = getCookie(event, cookieName ?? 'logtoCookies') ?? '';

  // Without a session cookie the request can only be unauthenticated; no coordination needed.
  if (!requestSessionValue) {
    const { logto } = await createLogtoClient(event, config);
    return respondWithAccessToken(event, logto, query);
  }

  return runSessionExclusive(requestSessionValue, async () => {
    const adoptedSessionValue = getRotatedSessionValue(requestSessionValue);
    const { logto, getPersistedSessionValue } = await createLogtoClient(
      event,
      config,
      adoptedSessionValue
    );

    try {
      return await respondWithAccessToken(event, logto, query);
    } finally {
      /**
       * Share the session minted here (a refresh, but also a cleared session) with requests that
       * are still queued on a superseded cookie, and with requests that arrive with the new
       * cookie, so chained rotations cannot strand a request on a consumed refresh token.
       */
      const persistedSessionValue = getPersistedSessionValue();

      if (persistedSessionValue) {
        recordRotatedSessionValue(requestSessionValue, persistedSessionValue);
      }
    }
  });
};

/**
 * Handle a client-side access token request.
 *
 * A still-valid cached token is reused; otherwise the refresh token is exchanged for a new one
 * through the server-side session. Since the client is bound to the current request, refreshed
 * tokens are written back to the response cookies before this function returns.
 *
 * The access token itself is the only credential that leaves the server. The refresh token and the
 * application secret never reach the browser.
 *
 * @param event The current request, used to persist a refreshed session.
 * @param client The request-scoped Logto client.
 * @param options The resource and organization to grant the token for, matching the server-side
 * `getAccessToken` parameters.
 * @throws A `401` error carrying {@link NotAuthenticatedErrorCode} when the session is missing or
 * can no longer be refreshed, so the caller can start a sign-in instead of retrying.
 */
export const respondWithAccessToken = async (
  event: H3Event,
  client: LogtoClient,
  { resource, organizationId }: { resource?: string; organizationId?: string } = {}
): Promise<AccessTokenResponse> => {
  if (!(await client.isAuthenticated())) {
    throwNotAuthenticated();
  }

  try {
    const accessToken = await client.getAccessToken(resource, organizationId);

    // A token response must never be stored by the browser or by an intermediary.
    setResponseHeader(event, 'Cache-Control', 'no-store');

    return { accessToken };
  } catch (error: unknown) {
    if (error instanceof LogtoClientError && error.code === 'not_authenticated') {
      throwNotAuthenticated();
    }

    if (error instanceof LogtoRequestError && unrecoverableRefreshErrorCodes.has(error.code)) {
      /**
       * The refresh token was rejected, so the session is dead. Drop the stale tokens before
       * responding: the next request then reports an unauthenticated user straight away instead of
       * replaying the same doomed refresh.
       */
      await trySafe(async () => client.clearAllTokens());
      throwNotAuthenticated();
    }

    throw error;
  }
};
