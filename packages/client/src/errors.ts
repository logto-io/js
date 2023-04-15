const logtoClientErrorCodes = Object.freeze({
  'sign_in_session.invalid': 'Invalid sign-in session.',
  'sign_in_session.not_found': 'Sign-in session not found.',
  not_authenticated: 'Not authenticated.',
  fetch_user_info_failed: 'Unable to fetch user info. The access token may be invalid.',
});

export type LogtoClientErrorCode = keyof typeof logtoClientErrorCodes;

export class LogtoClientError extends Error {
  code: LogtoClientErrorCode;
  data: unknown;

  constructor(code: LogtoClientErrorCode, data?: unknown) {
    super(logtoClientErrorCodes[code]);
    this.code = code;
    this.data = data;
  }
}
