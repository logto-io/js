import LogtoClient, {
  CookieStorage,
  type LogtoConfig,
  type PersistKey,
  type Storage,
} from '@logto/node';
// eslint-disable-next-line import/no-duplicates -- Distinct SvelteKit entry points share one declaration file.
import { isRedirect, redirect, type RequestEvent } from '@sveltejs/kit';
// eslint-disable-next-line import/no-duplicates -- `sequence` is only exported from the hooks entry point.
import { type sequence } from '@sveltejs/kit/hooks';

export type {
  AccessTokenClaims,
  ClientAdapter,
  CookieConfig,
  IdTokenClaims,
  InteractionMode,
  JwtVerifier,
  LogtoClientErrorCode,
  LogtoConfig,
  LogtoErrorCode,
  Storage,
  StorageKey,
  UserInfoResponse,
} from '@logto/node';

export {
  CookieStorage,
  default as LogtoClient,
  LogtoClientError,
  LogtoError,
  LogtoRequestError,
  OidcError,
  CacheKey,
  PersistKey,
  Prompt,
  ReservedResource,
  ReservedScope,
  StandardLogtoClient,
  UserScope,
  buildOrganizationUrn,
  decodeAccessToken,
  getOrganizationIdFromUrn,
  organizationUrnPrefix,
} from '@logto/node';

export type HookConfig = {
  /**
   * Whether to allow external `postRedirectUri` values after handling the sign-in callback.
   * Only takes effect in SvelteKit 3 and later. SvelteKit 2 retains its existing redirect behavior.
   * Redirects to Logto for sign-in and sign-out are always allowed.
   * Applies to the default client; custom clients supplied by `buildLogtoClient` handle their own redirects.
   * @default false
   */
  allowExternalPostRedirectUri?: boolean;
  /**
   * The error response factory when an error occurs during the callback. If not provided, a 400
   * response will be returned.
   *
   * @param error The error that occurred.
   */
  onCallbackError?: (error: unknown) => Response;
  /**
   * The error response factory when an error occurs during fetching user info or parsing the IdToken.
   * If not provided, a 500 response will be returned.
   *
   * @param error
   */
  onGetUserInfoError?: (error: unknown) => Response;
  /**
   * The path to the callback handler. Default to `/callback`.
   */
  signInCallback?: string;
  /**
   * Whether to fetch user info via OIDC userinfo endpoint. Default to `false`.
   */
  fetchUserInfo?: boolean;
  /**
   * The factory to build the `LogtoClient` instance. If not provided, a default instance will be
   * created.
   */
  buildLogtoClient?: (event: RequestEvent) => LogtoClient;
  /**
   * The custom persistent storage instance parsed to the `LogtoClient`. It will be used to store the session and tokens.
   * If not provided, a default `CookieStorage` instance will be created.
   */
  customStorage?: Storage<PersistKey>;
};

// `Handle` moved modules in SvelteKit 3; `sequence` accepts it in both supported versions.
type Handle = Parameters<typeof sequence>[0];

// SvelteKit 2 ignores the optional third argument; SvelteKit 3 uses it to allow external redirects.
const redirectWithOptions: (
  status: Parameters<typeof redirect>[0],
  location: Parameters<typeof redirect>[1],
  options?: { external?: boolean }
) => never = redirect;

/**
 * The factory to create a SvelteKit hook to handle Logto authentication. The hook will
 * initialize the `LogtoClient` instance and add it to the `locals` of the request event. It will
 * also handle the callback from the OIDC provider and fetch user info if necessary.
 *
 * @example
 * Here is a minimal example of how to use this hook:
 * ```ts
 * // src/hooks.server.ts
 * import { handleLogto } from '@logto/sveltekit';
 * import { env } from '$env/dynamic/private';
 *
 * export const handle = handleLogto(
 *   {
 *     endpoint: env.LOGTO_ENDPOINT,
 *     appId: env.LOGTO_APP_ID,
 *     appSecret: env.LOGTO_APP_SECRET,
 *   },
 *   {
 *     encryptionKey: env.LOGTO_COOKIE_ENCRYPTION_KEY,
 *   }
 * );
 * // Then you can use the `logtoClient` and `user` in `locals` of the request event.
 *
 * // For TypeScript, you can extend the `Locals` interface to add the `logtoClient` and `user` properties:
 * // app.d.ts
 * import type { UserInfoResponse, LogtoClient } from '@logto/sveltekit';
 *
 * declare global {
 *   namespace App {
 *     interface Locals {
 *       logtoClient: LogtoClient;
 *       user?: UserInfoResponse;
 *     }
 *   }
 * }
 * ```
 *
 * @param config The Logto configuration.
 * @param cookieConfig The configuration object for the cookie storage. Required if no custom storage is provided.
 * @param hookConfig The configuration object for the hook itself.
 * @returns The SvelteKit hook.
 */

export const handleLogto = (
  config: LogtoConfig,
  cookieConfig?: {
    encryptionKey: string;
    cookieKey?: string;
  },
  hookConfig?: HookConfig
): Handle => {
  const {
    signInCallback = '/callback',
    onCallbackError,
    onGetUserInfoError,
    fetchUserInfo = false,
    buildLogtoClient,
  } = hookConfig ?? {};

  // eslint-disable-next-line complexity
  return async ({ resolve, event }) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- sanity check
    if (event.locals.logtoClient) {
      console.warn(
        '`logtoClient` already exists in `locals`, you probably have added the `handleLogto` hook more than once. Skipping.'
      );
      return resolve(event);
    }

    const storage =
      hookConfig?.customStorage ?? (await buildCookieStorageFromEvent(event, cookieConfig));

    const logtoClient =
      buildLogtoClient?.(event) ??
      new LogtoClient(config, {
        navigate: (url, { for: purpose }) => {
          redirectWithOptions(302, url, {
            external:
              purpose !== 'post-sign-in' || (hookConfig?.allowExternalPostRedirectUri ?? false),
          });
        },
        storage,
      });

    // eslint-disable-next-line @silverhand/fp/no-mutation -- for init
    event.locals.logtoClient = logtoClient;

    if (event.url.pathname === signInCallback) {
      try {
        await logtoClient.handleSignInCallback(event.url.href);
      } catch (error: unknown) {
        if (isRedirect(error)) {
          // eslint-disable-next-line @typescript-eslint/no-throw-literal -- SvelteKit's convention
          throw error;
        }

        return onCallbackError?.(error) ?? defaultErrorHandler(error, 400);
      }

      return redirect(302, '/');
    }

    if (await logtoClient.isAuthenticated()) {
      try {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        event.locals.user = await (fetchUserInfo
          ? logtoClient.fetchUserInfo()
          : logtoClient.getIdTokenClaims());
      } catch (error: unknown) {
        return onGetUserInfoError?.(error) ?? defaultErrorHandler(error);
      }
    }

    return resolve(event);
  };
};

const defaultErrorHandler = (error: unknown, status = 500): Response => {
  return new Response(
    `Error: ${error instanceof Error ? error.message : JSON.stringify(error, undefined, 2)}`,
    {
      status,
    }
  );
};

const buildCookieStorageFromEvent = async (
  event: RequestEvent,
  cookieConfig?: {
    encryptionKey: string;
    cookieKey?: string;
  }
): Promise<CookieStorage> => {
  if (!cookieConfig) {
    throw new Error('Missing cookie configuration for the CookieStorage.');
  }

  const storage = new CookieStorage({
    setCookie: (...args) => {
      event.cookies.set(...args);
    },
    getCookie: (...args) => event.cookies.get(...args),
    isSecure:
      event.request.headers.get('x-forwarded-proto') === 'https' ||
      event.request.url.startsWith('https'),
    ...cookieConfig,
  });

  await storage.init();

  return storage;
};
