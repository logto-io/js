import { AxiosResponse } from 'axios';
import { ZodError } from 'zod';

interface OPErrorParmeters {
  message?: string;
  uri?: string;
  zodError?: ZodError;
  originalError?: Error;
}

export class OPError extends Error {
  public uri?: string;
  public response?: AxiosResponse;
  public originalError?: Error | ZodError;

  constructor({ message, uri, zodError, originalError }: OPErrorParmeters) {
    if (zodError) {
      super(`OP response format error: ${zodError.message}`);
      this.originalError = zodError;
    } else {
      super(message);

      if (originalError) {
        this.originalError = originalError;
      }
    }

    this.uri = uri;
  }
}
