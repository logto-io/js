import qs from 'query-string';

export interface AuthenticationResult {
  code?: string;
  error?: string;
  error_description?: string;
}

export const parseRedirectCallback = (url: string) => {
  const [, queryString] = url.split('?');
  if (!queryString) {
    throw new Error('There are no query params available for parsing.');
  }

  const result = qs.parse(queryString) as AuthenticationResult;

  return result;
};
