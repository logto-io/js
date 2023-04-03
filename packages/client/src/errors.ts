const logtoClientErrorCodes = Object.freeze({
  sign_in_session_invalid: 'Invalid sign-in session.',
  sign_in_session_not_found: 'Sign-in session not found.',
  not_authenticated: 'Not authenticated.',
  get_access_token_by_refresh_token_failed: 'Failed to get access token by refresh token.',
  fetch_user_info_failed: 'Unable to fetch user info. The access token may be invalid.',
  invalid_id_token: 'Invalid id token.',
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
