import type { LogtoRuntimeConfigInput } from './types';

/** The keys used to store the Logto state in `useState()`. */
export enum LogtoStateKey {
  /** The key used to store the Logto user information. */
  User = 'logto.user',
  /** The key prefix used to store access tokens, keyed by resource and organization. */
  AccessToken = 'logto.accessToken',
}

/**
 * The machine-readable error code returned when the browser has to start a new sign-in before it
 * can obtain an access token again.
 *
 * It is shared between the server handler that produces it and the composable that surfaces it, so
 * it lives here rather than next to either of them.
 */
export const NotAuthenticatedErrorCode = 'not_authenticated';

/** The default Logto runtime configuration values that should be replaced with your own values. */
export const defaults = Object.freeze({
  endpoint: '<replace-with-logto-endpoint>',
  appId: '<replace-with-logto-app-id>',
  appSecret: '<replace-with-logto-app-secret>',
  cookieEncryptionKey: '<replace-with-random-string>',
} as const satisfies LogtoRuntimeConfigInput);
