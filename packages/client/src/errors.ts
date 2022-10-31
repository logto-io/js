import { NormalizeKeyPaths } from '@silverhand/essentials';
import get from 'lodash.get';

const logtoClientErrorCodes = Object.freeze({
  sign_in_session: {
    invalid: 'Invalid sign-in session.',
    not_found: 'Sign-in session not found.',
  },
  not_authenticated: 'Not authenticated.',
  invalid_id_token: 'Invalid id token.',
  refresh_token_not_found: 'Refresh token not found.',
  access_token_not_found: 'Access token not found.',
});

export type LogtoClientErrorCode = NormalizeKeyPaths<typeof logtoClientErrorCodes>;

const getMessageByErrorCode = (errorCode: LogtoClientErrorCode): string => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const message = get(logtoClientErrorCodes, errorCode);

  if (typeof message === 'string') {
    return message;
  }

  return errorCode;
};

export class LogtoClientError extends Error {
  code: LogtoClientErrorCode;
  data: unknown;

  constructor(code: LogtoClientErrorCode, data?: unknown) {
    super(getMessageByErrorCode(code));
    this.code = code;
    this.data = data;
  }
}
