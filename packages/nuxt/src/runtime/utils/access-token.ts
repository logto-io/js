import { type default as LogtoClient, LogtoClientError, LogtoRequestError } from '@logto/node';
import { trySafe } from '@silverhand/essentials';
import { createError, type H3Event, setResponseHeader } from 'h3';

import { NotAuthenticatedErrorCode } from './constants';

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
