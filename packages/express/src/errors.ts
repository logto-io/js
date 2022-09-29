import { LogtoBaseError } from '@logto/node';

const logtoExpressErrorCodes = Object.freeze({
  session_not_configured: 'You should configure express-session before using Logto express SDK.',
});

export type LogtoClientErrorCode = keyof typeof logtoExpressErrorCodes;

export class LogtoExpressError extends LogtoBaseError<LogtoClientErrorCode> {
  constructor(code: LogtoClientErrorCode, data?: unknown) {
    super(code, logtoExpressErrorCodes[code], data);
  }
}
