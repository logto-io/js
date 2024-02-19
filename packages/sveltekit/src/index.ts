import LogtoClient, { type LogtoConfig } from '@logto/node';
import { redirect, type Handle } from '@sveltejs/kit';

import { CookieStorage, type CookieConfig } from './cookie-storage.js';

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
  onCallbackError?: (error: unknown) => Response;
  signInCallback?: string;
  fetchUserInfo?: boolean;
};

export const handleLogto = (
  config: LogtoConfig,
  cookieConfig: Omit<CookieConfig, 'requestEvent'>,
  hookConfig?: HookConfig
): Handle => {
  const { signInCallback = '/callback', onCallbackError, fetchUserInfo = false } = hookConfig ?? {};

  return async ({ resolve, event }) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- sanity check
    if (event.locals.logtoClient) {
      console.warn('logtoClient already exists in `locals`, skipping initialization');
      return resolve(event);
    }

    const storage = new CookieStorage({ requestEvent: event, ...cookieConfig });
    await storage.init();

    const logtoClient = new LogtoClient(config, {
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

      redirect(302, '/');
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
