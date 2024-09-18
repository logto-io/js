import type { LogtoRuntimeConfigInput } from './types';

/** The keys used to store the Logto state in `useState()`. */
export enum LogtoStateKey {
  /** The key used to store the Logto user information. */
  User = 'logto.user',
}

/** The default Logto runtime configuration values that should be replaced with your own values. */
export const defaults = Object.freeze({
  endpoint: '<replace-with-logto-endpoint>',
  appId: '<replace-with-logto-app-id>',
  appSecret: '<replace-with-logto-app-secret>',
  cookieEncryptionKey: '<replace-with-random-string>',
  customRedirectBaseUrl: '<replace-with-custom-redirect-base-url>',
} as const satisfies LogtoRuntimeConfigInput);
