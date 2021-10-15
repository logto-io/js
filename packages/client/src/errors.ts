import { AxiosResponse } from 'axios';
import { ZodError } from 'zod';

interface OPErrorParmeters {
  errorMessage?: string;
  errorUri?: string;
  errorDescription?: string;
  zodError?: ZodError;
  originalError?: Error;
}

export class OPError extends Error {
  public errorMessage?: string;
  public errorUri?: string;
  public errorDescription?: string;
  public response?: AxiosResponse;
  public originalError?: Error | ZodError;

  constructor({
    errorMessage,
    errorUri,
    errorDescription,
    zodError,
    originalError,
  }: OPErrorParmeters) {
    if (zodError) {
      super(`OP response format error: ${zodError.message}`);
      this.originalError = zodError;
    } else {
      super(errorDescription ? `${errorMessage} (${errorDescription})` : errorMessage);

      if (originalError) {
        this.originalError = originalError;
      }
    }

    this.errorMessage = errorMessage;
    this.errorDescription = errorDescription;
    this.errorUri = errorUri;
  }
}
