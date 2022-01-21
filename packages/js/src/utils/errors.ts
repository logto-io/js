import { NormalizeKeyPaths } from '@silverhand/essentials';
import get from 'lodash.get';

const logtoErrorCodes = Object.freeze({
  idToken: {
    invalidIat: 'Invalid issued at time',
    invalidToken: 'Invalid token',
  },
  callback_uri_verification: {
    redirect_uri_mismatched: 'Redirect URI mismatched',
    error_found: 'Error found',
    missing_state: 'Missing state',
    state_mismatched: 'State mismatched',
    missing_code: 'Missing code',
  },
});

export type LogtoErrorCode = NormalizeKeyPaths<typeof logtoErrorCodes>;

const getMessageByErrorCode = (errorCode: LogtoErrorCode): string => {
  // TODO: linear issue LOG-1419
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const message = get(logtoErrorCodes, errorCode);
  if (typeof message === 'string') {
    return message;
  }

  return errorCode;
};

export class LogtoError extends Error {
  code: LogtoErrorCode;
  error?: string;
  errorDescription?: string;

  constructor(code: LogtoErrorCode, error?: string, errorDescription?: string) {
    super(getMessageByErrorCode(code));
    this.code = code;
    this.error = error;
    this.errorDescription = errorDescription;
  }
}
