import { LogtoError, LogtoRequestError, logtoRequestErrorSchema, Requester } from '@logto/js';

export const createRequester = (fetchFunction: typeof fetch): Requester => {
  return async <T>(...args: Parameters<typeof fetch>): Promise<T> => {
    const response = await fetchFunction(...args);

    if (!response.ok) {
      const responseJson = await response.json();

      if (!logtoRequestErrorSchema.is(responseJson)) {
        throw new LogtoError('unexpected_response_error', responseJson);
      }

      // Expected request error from server
      const { code, message } = responseJson;
      throw new LogtoRequestError(code, message);
    }

    return response.json();
  };
};
