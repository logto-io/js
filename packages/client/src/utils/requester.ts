import type { Requester } from '@logto/js';
import { LogtoError, LogtoRequestError, isLogtoRequestErrorJson } from '@logto/js';
import { trySafe } from '@silverhand/essentials';

import { assertRequestTimeout } from '../request-timeout.js';

export type CreateRequesterOptions = Readonly<{
  /** The timeout in milliseconds for each request. Must be an integer from 1 to 2,147,483,647. */
  requestTimeoutMs?: number | undefined;
}>;

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

const getRequestSignal = (input: RequestInfo | URL, init?: RequestInit) => {
  if (init?.signal === null) {
    return;
  }

  if (init?.signal) {
    return init.signal;
  }

  return typeof Request === 'undefined' || !(input instanceof Request) ? undefined : input.signal;
};

const parseResponse = async <T>(response: Response): Promise<T> =>
  response.ok ? response.json() : parseErrorResponse(response);

/**
 * A factory function that creates a requester by accepting a `fetch`-like function.
 *
 * @param fetchFunction A `fetch`-like function.
 * @param options Request policies applied on top of the fetch-like function.
 * @returns A requester function.
 * @see {@link Requester}
 */
export const createRequester = (
  fetchFunction: typeof fetch,
  options: CreateRequesterOptions = {}
): Requester => {
  const { requestTimeoutMs } = options;
  assertRequestTimeout(requestTimeoutMs);

  return async <T>(...args: Parameters<typeof fetch>): Promise<T> => {
    if (requestTimeoutMs === undefined) {
      return parseResponse<T>(await fetchFunction(...args));
    }

    const [input, init] = args;
    const requestSignal = getRequestSignal(input, init);
    const timeoutSignal = AbortSignal.timeout(requestTimeoutMs);
    const signal = requestSignal ? AbortSignal.any([requestSignal, timeoutSignal]) : timeoutSignal;
    const requestInit =
      init === undefined && typeof Request !== 'undefined' && input instanceof Request
        ? { referrer: input.referrer, referrerPolicy: input.referrerPolicy }
        : init;

    try {
      return await parseResponse<T>(await fetchFunction(input, { ...requestInit, signal }));
    } finally {
      signal.throwIfAborted();
    }
  };
};
