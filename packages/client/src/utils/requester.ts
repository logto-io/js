import type { Requester } from '@logto/js';
import { LogtoError, LogtoRequestError, isLogtoRequestErrorJson } from '@logto/js';
import { trySafe } from '@silverhand/essentials';

const parseErrorResponse = async (response: Response): Promise<never> => {
  const responseText = await response.clone().text();
  const responseJson = trySafe<unknown>(() => JSON.parse(responseText));

  if (responseJson === undefined) {
    console.error(`Logto requester error: [status=${response.status}]`, responseText);
    throw new LogtoRequestError(
      response.status === 429 ? 'rate_limited' : `http_error_${response.status}`,
      responseText || response.statusText,
      response
    );
  }

  console.error(`Logto requester error: [status=${response.status}]`, responseJson);

  if (!isLogtoRequestErrorJson(responseJson)) {
    throw new LogtoError('unexpected_response_error', responseJson);
  }

  const { code, message } = responseJson;
  throw new LogtoRequestError(code, message, response);
};

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
      return parseErrorResponse(response);
    }

    return response.json();
  };
};
