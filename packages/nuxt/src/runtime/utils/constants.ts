import type { LogtoRuntimeConfigInput } from './types';

export enum LogtoStateKey {
  User = 'logto.user',
}

export const defaults = Object.freeze({
  endpoint: '<replace-with-logto-endpoint>',
  appId: '<replace-with-logto-app-id>',
  appSecret: '<replace-with-logto-app-secret>',
  cookieEncryptionKey: '<replace-with-random-string>',
} as const satisfies LogtoRuntimeConfigInput);
