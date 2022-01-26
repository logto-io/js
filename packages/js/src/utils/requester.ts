import { isNode } from '@silverhand/essentials';

import { LogtoError } from './errors';

interface LogtoErrorResponse {
  error?: string;
  error_description?: string;
}

interface LogtoErrorParameters extends LogtoErrorResponse {
  message?: string;
}

const getLogtoErrorParametersByResponse = async (
  response: Response
): Promise<LogtoErrorParameters> => {
  const text = await response.text();
  try {
    const data = JSON.parse(text) as LogtoErrorResponse;
    if (data.error || data.error_description) {
      return {
        error: data.error,
        error_description: data.error_description,
      };
    }

    return { message: response.statusText };
  } catch {
    return { message: text };
  }
};

export const createRequester = (fetchFunction?: typeof fetch) => {
  if (!fetchFunction && isNode()) {
    throw new LogtoError('requester.not_provide_fetch');
  }

  return async <T>(...args: Parameters<typeof fetch>): Promise<T> => {
    const response = await (fetchFunction ?? fetch)(...args);

    if (!response.ok) {
      const logtoErrorMessage = await getLogtoErrorParametersByResponse(response);
      throw new LogtoError(
        'requester.failed',
        logtoErrorMessage.error,
        logtoErrorMessage.error_description,
        logtoErrorMessage.message
      );
    }

    return (await response.json()) as T;
  };
};

export type Requester = ReturnType<typeof createRequester>;
