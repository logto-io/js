const logtoExpressErrorCodes = Object.freeze({
  session_not_configured: 'You should configure express-session before using Logto express SDK.',
});

export type LogtoClientErrorCode = keyof typeof logtoExpressErrorCodes;

export class LogtoExpressError extends Error {
  code: LogtoClientErrorCode;
  data: unknown;

  constructor(code: LogtoClientErrorCode, data?: unknown) {
    super(logtoExpressErrorCodes[code]);
    this.code = code;
    this.data = data;
  }
}
