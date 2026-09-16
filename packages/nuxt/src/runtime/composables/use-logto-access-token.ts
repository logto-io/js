import { useNuxtApp, useRuntimeConfig, useState, type NuxtApp } from '#app';
import { computed } from 'vue';

import { LogtoStateKey, NotAuthenticatedErrorCode } from '../utils/constants';

export type UseLogtoAccessTokenOptions = {
  /**
   * The resource that the access token is granted for. Defaults to the OpenID Connect or default
   * resource configured in the Logto Console.
   */
  resource?: string;
  /** The ID of the organization that the access token is granted for. */
  organizationId?: string;
};

export type LogtoAccessTokenError = {
  /** The HTTP status code of the failed request. `0` when the request never completed. */
  statusCode: number;
  /**
   * A machine-readable code. `not_authenticated` means the session is missing or can no longer be
   * refreshed, so the application should start a sign-in instead of retrying.
   */
  code: string;
};

type AccessTokenState = {
  accessToken?: string;
  pending: boolean;
  error?: LogtoAccessTokenError;
};

type AccessTokenResponse = {
  accessToken: string;
};

/** The code used when the request failed for a reason other than authentication. */
const RequestFailedErrorCode = 'request_failed';

/**
 * Tracks in-flight token requests per Nuxt app instance, which is request-scoped on the server and
 * page-scoped in the browser. Sharing them between components is what stops concurrent callers
 * from each starting their own refresh.
 */
const inFlightRequests = new WeakMap<NuxtApp, Map<string, Promise<string | undefined>>>();

const isObjectLike = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const buildRequestKey = (path: string, { resource, organizationId }: UseLogtoAccessTokenOptions) =>
  `${path}|${resource ?? ''}|${organizationId ?? ''}`;

const buildStateKey = ({ resource, organizationId }: UseLogtoAccessTokenOptions) =>
  `${LogtoStateKey.AccessToken}.${resource ?? ''}.${organizationId ?? ''}`;

/**
 * Translate an `ofetch` failure into the error surfaced to the caller. The endpoint reports an
 * unusable session as `401` with a `not_authenticated` body, which is the signal to sign in again.
 */
const toAccessTokenError = (error: unknown): LogtoAccessTokenError => {
  const statusCode =
    isObjectLike(error) && typeof error.statusCode === 'number' ? error.statusCode : 0;
  const data = isObjectLike(error) ? error.data : undefined;

  if (isObjectLike(data) && typeof data.code === 'string') {
    return { statusCode, code: data.code };
  }

  return {
    statusCode,
    code: statusCode === 401 ? NotAuthenticatedErrorCode : RequestFailedErrorCode,
  };
};

/**
 * Get an access token for browser-to-API requests, refreshing it on demand.
 *
 * The refresh itself always runs on the server against the existing session: the browser only
 * receives the access token, never the refresh token or the application secret. Because the
 * endpoint is served by the same request-scoped client as the rest of the SDK, a refreshed session
 * is persisted to the cookies before the response is returned.
 *
 * Call `refresh()` whenever you need a valid token. The state is shared between every component
 * using the same resource and organization, and concurrent calls share a single request.
 *
 * Note: `refresh()` only runs in the browser. During SSR the state stays empty, which also means no
 * access token is ever serialized into the server-rendered payload. Use `useLogtoClient()` for
 * server-side token retrieval.
 *
 * @example
 * ```ts
 * const { refresh, error } = useLogtoAccessToken();
 *
 * const load = async () => {
 *   const accessToken = await refresh();
 *
 *   if (!accessToken) {
 *     // `not_authenticated` means retrying cannot help; send the user to sign in instead.
 *     await navigateTo('/sign-in');
 *     return;
 *   }
 *
 *   return $fetch('/api/profile', { headers: { Authorization: `Bearer ${accessToken}` } });
 * };
 * ```
 */
export default function useLogtoAccessToken(options: UseLogtoAccessTokenOptions = {}) {
  const nuxtApp = useNuxtApp();
  const { accessTokenPath } = useRuntimeConfig().public.logto;
  const state = useState<AccessTokenState>(buildStateKey(options), () => ({ pending: false }));

  const setState = (value: AccessTokenState) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- `useState` values are refs
    state.value = value;
  };

  const refresh = async (): Promise<string | undefined> => {
    /**
     * Only the browser starts token requests. Server-side code already has the request-scoped
     * client, and answering here would leak the token into the server-rendered payload.
     */
    if (import.meta.server) {
      return;
    }

    const key = buildRequestKey(accessTokenPath, options);
    const pendingRequests =
      inFlightRequests.get(nuxtApp) ?? new Map<string, Promise<string | undefined>>();
    inFlightRequests.set(nuxtApp, pendingRequests);

    const inFlight = pendingRequests.get(key);

    if (inFlight) {
      return inFlight;
    }

    const request = (async () => {
      setState({ ...state.value, pending: true, error: undefined });

      try {
        const { accessToken } = await $fetch<AccessTokenResponse>(accessTokenPath, {
          query: {
            ...(options.resource ? { resource: options.resource } : {}),
            ...(options.organizationId ? { organizationId: options.organizationId } : {}),
          },
          /** Tokens are session-bound: never let the browser or a proxy reuse a cached response. */
          cache: 'no-store',
        });

        setState({ accessToken, pending: false });

        return accessToken;
      } catch (error: unknown) {
        setState({ pending: false, error: toAccessTokenError(error) });

        return;
      } finally {
        pendingRequests.delete(key);
      }
    })();

    pendingRequests.set(key, request);

    return request;
  };

  return {
    /** The most recently obtained access token, if any. */
    accessToken: computed(() => state.value.accessToken),
    /** Whether a token request is currently in flight. */
    pending: computed(() => state.value.pending),
    /** The error of the most recent request, cleared when a new request starts. */
    error: computed(() => state.value.error),
    refresh,
  };
}
