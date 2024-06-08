import { isArbitraryObject } from './arbitrary-object.js';

const logtoErrorCodes = Object.freeze({
  'id_token.invalid_iat': 'Invalid issued at time in the ID token',
  'id_token.invalid_token': 'Invalid ID token',
  'callback_uri_verification.redirect_uri_mismatched':
    'The callback URI mismatches the redirect URI.',
  'callback_uri_verification.error_found': 'Error found in the callback URI',
  'callback_uri_verification.missing_state': 'Missing state in the callback URI',
  'callback_uri_verification.state_mismatched': 'State mismatched in the callback URI',
  'callback_uri_verification.missing_code': 'Missing code in the callback URI',
  crypto_subtle_unavailable: 'Crypto.subtle is unavailable in insecure contexts (non-HTTPS).',
  unexpected_response_error: 'Unexpected response error from the server.',
});

export type LogtoErrorCode = keyof typeof logtoErrorCodes;

export class LogtoError extends Error {
  name = 'LogtoError';

  constructor(
    public code: LogtoErrorCode,
    public data?: unknown
  ) {
    super(logtoErrorCodes[code]);
  }
}

export const isLogtoRequestError = (data: unknown): data is LogtoRequestError => {
  if (!isArbitraryObject(data)) {
    return false;
  }

  return data instanceof Error && data.name === 'LogtoRequestError';
};

export class LogtoRequestError extends Error {
  name = 'LogtoRequestError';

  constructor(
    public code: string,
    message: string,
    /** The original response object from the server. */
    public cause?: Response
  ) {
    super(message);
  }
}

export class OidcError {
  name = 'OidcError';

  constructor(
    public error: string,
    public errorDescription?: string
  ) {}
}
