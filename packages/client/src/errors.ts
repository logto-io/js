import { AxiosResponse } from 'axios';
import { ZodError } from 'zod';

interface OPErrorParmeters {
  message?: string;
  uri?: string;
  originalError?: Error;
}

export class OPError extends Error {
  public uri?: string;
  public response?: AxiosResponse;
  public originalError?: Error | ZodError;

  constructor({ message, uri, originalError }: OPErrorParmeters) {
    if (originalError instanceof ZodError) {
      super(`OP response format error: ${originalError.message}`);
    } else {
      super(message);
    }

    if (originalError) {
      this.originalError = originalError;
    }

    this.uri = uri;
  }
}
