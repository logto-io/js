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
      const cloned = response.clone();
      const responseJson: unknown = await response
        .clone()
        .json()
        .catch(async () => {
          const responseText = await response.text();
          console.error(`Logto requester error: [status=${response.status}]`, responseText);
          throw new LogtoRequestError(
            response.status === 429 ? 'rate_limited' : `http_error_${response.status}`,
            responseText || response.statusText,
            cloned
          );
        });

      console.error(`Logto requester error: [status=${response.status}]`, responseJson);

      if (!isLogtoRequestErrorJson(responseJson)) {
        throw new LogtoError('unexpected_response_error', responseJson);
      }

      // Expected request error from server
      const { code, message } = responseJson;
      throw new LogtoRequestError(code, message, cloned);
    }

    return response.json();
  };
};
