import qs from 'query-string';

export interface AuthenticationResult {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

export const parseRedirectCallback = (url: string): AuthenticationResult => {
  const [, queryString] = url.split('?');
  if (!queryString) {
    return {};
  }

  const result = qs.parse(queryString);
  return result;
};
