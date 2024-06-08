import type { Requester } from '@logto/js';
import { LogtoError, LogtoRequestError, isLogtoRequestErrorJson } from '@logto/js';

/**
 * A factory function that creates a requester by accepting a `fetch`-like function.
 *
 * @param fetchFunction A `fetch`-like function.
 * @returns A requester function.
 * @see {@link Requester}
 */
export const createRequester = (fetchFunction: typeof fetch): Requester => {
  return async <T>(...args: Parameters<typeof fetch>): Promise<T> => {
    const response = await fetchFunction(...args);

    if (!response.ok) {
      const responseJson = await response.json();
      console.error(`Logto requester error: [status=${response.status}]`, responseJson);

      if (!isLogtoRequestErrorJson(responseJson)) {
        throw new LogtoError('unexpected_response_error', responseJson);
      }

      // Expected request error from server
      const { code, message } = responseJson;
      throw new LogtoRequestError(code, message, response.clone());
    }

    return response.json();
  };
};
