import { isNode } from '@silverhand/essentials';

import { LogtoError } from '../modules/errors';

declare interface LogtoErrorResponse {
  error_description?: string;
}

const getResponseErrorMessage = async (response: Response): Promise<string> => {
  const text = await response.text();
  try {
    const data = JSON.parse(text) as LogtoErrorResponse;
    if (data.error_description) {
      return data.error_description;
    }

    return response.statusText;
  } catch {
    return text;
  }
};

export const createRequester = (fetchFunction?: typeof fetch) => {
  if (!fetchFunction && isNode()) {
    throw new Error('You should provide a fetch function in NodeJS');
  }

  return async <T>(...args: Parameters<typeof fetch>): Promise<T> => {
    const response = await (fetchFunction ?? fetch)(...args);
    if (!response.ok) {
      throw new LogtoError({
        message: await getResponseErrorMessage(response),
        response,
      });
    }

    const data = (await response.json()) as T;
    return data;
  };
};

export type Requester = ReturnType<typeof createRequester>;
