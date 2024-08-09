import LogtoClient, {
  CookieStorage,
  type CookieConfig,
  type LogtoConfig,
  type PersistKey,
  type Storage,
} from '@logto/node';
import { isRedirect, redirect, type Handle, type RequestEvent } from '@sveltejs/kit';

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
  PersistKey,
  Prompt,
  ReservedResource,
  ReservedScope,
  StandardLogtoClient,
  UserScope,
  buildOrganizationUrn,
  getOrganizationIdFromUrn,
  organizationUrnPrefix,
} from '@logto/node';

export type HookConfig = {
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
  cookieConfig?: Pick<CookieConfig, 'cookieKey' | 'encryptionKey'>,
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
        navigate: (url) => {
          redirect(302, url);
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
  cookieConfig?: Pick<CookieConfig, 'cookieKey' | 'encryptionKey'>
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
