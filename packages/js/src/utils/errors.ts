import { NormalizeKeyPaths } from '@silverhand/essentials';

const logtoErrorCodes = Object.freeze({
  idToken: {
    invalidIat: 'Invalid issued at time',
    invalidToken: 'Invalid token',
  },
});

export type LogtoErrorCode = NormalizeKeyPaths<typeof logtoErrorCodes>;

export class LogtoError extends Error {
  code: LogtoErrorCode;

  constructor(code: LogtoErrorCode, message?: string) {
    super(message);
    this.code = code;
  }
}
