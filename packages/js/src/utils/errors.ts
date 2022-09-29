import { NormalizeKeyPaths } from '@silverhand/essentials';
import get from 'lodash.get';

import { isArbitraryObject } from './arbitrary-object';

export abstract class LogtoBaseError<ErrorCode extends string> extends Error {
  constructor(public code: ErrorCode, message?: string, public data?: unknown) {
    super(message);
  }
}

const logtoErrorCodes = Object.freeze({
  id_token: {
    invalid_iat: 'Invalid issued at time in the ID token',
    invalid_token: 'Invalid ID token',
  },
  callback_uri_verification: {
    redirect_uri_mismatched: 'The callback URI mismatches the redirect URI.',
    error_found: 'Error found in the callback URI',
    missing_state: 'Missing state in the callback URI',
    state_mismatched: 'State mismatched in the callback URI',
    missing_code: 'Missing code in the callback URI',
  },
  crypto_subtle_unavailable: 'Crypto.subtle is unavailable in insecure contexts (non-HTTPS).',
  unexpected_response_error: 'Unexpected response error from the server.',
});

export type LogtoErrorCode = NormalizeKeyPaths<typeof logtoErrorCodes>;

const getMessageByErrorCode = (errorCode: LogtoErrorCode): string => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const message = get(logtoErrorCodes, errorCode);

  if (typeof message === 'string') {
    return message;
  }

  return errorCode;
};

export class LogtoError extends LogtoBaseError<LogtoErrorCode> {
  constructor(code: LogtoErrorCode, data?: unknown) {
    super(code, getMessageByErrorCode(code), data);
  }
}

export const isLogtoRequestError = (data: unknown): data is { code: string; message: string } => {
  if (!isArbitraryObject(data)) {
    return false;
  }

  return typeof data.code === 'string' && typeof data.message === 'string';
};

export class LogtoRequestError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class OidcError {
  constructor(public error: string, public errorDescription?: string) {}
}
