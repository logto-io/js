import { isNode } from '@silverhand/essentials';

import { LogtoError, LogtoRequestError } from './errors';

interface LogtoRequestErrorBody {
  code: string;
  message: string;
}

export const createRequester = (fetchFunction?: typeof fetch) => {
  if (!fetchFunction && isNode()) {
    throw new LogtoError('requester.not_provide_fetch');
  }

  return async <T>(...args: Parameters<typeof fetch>): Promise<T> => {
    const response = await (fetchFunction ?? fetch)(...args);

    if (!response.ok) {
      // Expected request error from server
      const { code, message } = await response.json<LogtoRequestErrorBody>();
      throw new LogtoRequestError(code, message);
    }

    return response.json<T>();
  };
};

export type Requester = ReturnType<typeof createRequester>;
