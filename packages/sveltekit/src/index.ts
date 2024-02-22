import LogtoClient, { type LogtoConfig, type CookieConfig, CookieStorage } from '@logto/node';
import { redirect, type Handle, type RequestEvent } from '@sveltejs/kit';

export type {
  IdTokenClaims,
  LogtoErrorCode,
  LogtoConfig,
  LogtoClientErrorCode,
  Storage,
  StorageKey,
  InteractionMode,
  ClientAdapter,
  JwtVerifier,
  UserInfoResponse,
} from '@logto/node';

export {
  LogtoError,
  LogtoRequestError,
  LogtoClientError,
  OidcError,
  Prompt,
  ReservedScope,
  ReservedResource,
  UserScope,
  organizationUrnPrefix,
  buildOrganizationUrn,
  getOrganizationIdFromUrn,
  PersistKey,
  StandardLogtoClient,
  default as LogtoClient,
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
 * @param cookieConfig The configuration object for the cookie storage.
 * @param hookConfig The configuration object for the hook itself.
 * @returns The SvelteKit hook.
 */
export const handleLogto = (
  config: LogtoConfig,
  cookieConfig: Pick<CookieConfig, 'cookieKey' | 'encryptionKey'>,
  hookConfig?: HookConfig
): Handle => {
  const {
    signInCallback = '/callback',
    onCallbackError,
    fetchUserInfo = false,
    buildLogtoClient,
  } = hookConfig ?? {};

  return async ({ resolve, event }) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- sanity check
    if (event.locals.logtoClient) {
      console.warn(
        '`logtoClient` already exists in `locals`, you probably have added the `handleLogto` hook more than once. Skipping.'
      );
      return resolve(event);
    }

    const storage = new CookieStorage(
      {
        setCookie: (...args) => {
          event.cookies.set(...args);
        },
        getCookie: (...args) => event.cookies.get(...args),
        ...cookieConfig,
      },
      event.request
    );
    await storage.init();

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
        return (
          onCallbackError?.(error) ??
          new Response(`Error: ${error instanceof Error ? error.message : String(error)}`, {
            status: 400,
          })
        );
      }

      return redirect(302, '/');
    }

    if (await logtoClient.isAuthenticated()) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      event.locals.user = await (fetchUserInfo
        ? logtoClient.fetchUserInfo()
        : logtoClient.getIdTokenClaims());
    }

    return resolve(event);
  };
};
