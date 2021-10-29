import { LogtoError } from './errors';

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

export const requestWithFetch = async <T>(...args: Parameters<typeof fetch>): Promise<T> => {
  const response = await fetch(...args);
  if (!response.ok) {
    throw new LogtoError({
      message: await getResponseErrorMessage(response),
      response,
    });
  }

  const data = (await response.json()) as T;
  return data;
};
