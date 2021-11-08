import { StructError } from 'superstruct';

interface LogtoErrorParameters {
  message?: string;
  cause?: Error;
  response?: Response;
}

export class LogtoError extends Error {
  public uri?: string;
  public response?: Response;
  public cause?: Error | StructError;

  constructor({ message, cause, response }: LogtoErrorParameters) {
    if (cause instanceof StructError) {
      super(`Remote response format error: ${cause.message}`);
    } else {
      super(message);
    }

    this.cause = cause;
    this.response = response;
  }
}
