import { LogtoRequestError, LogtoRequestErrorBody, Requester } from '@logto/js';

export const createRequester = (fetchFunction: typeof fetch): Requester => {
  return async <T>(...args: Parameters<typeof fetch>): Promise<T> => {
    const response = await fetchFunction(...args);

    if (!response.ok) {
      // Expected request error from server
      const { code, message } = await response.json<LogtoRequestErrorBody>();
      throw new LogtoRequestError(code, message);
    }

    return response.json<T>();
  };
};
