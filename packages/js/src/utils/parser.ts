import qs from 'query-string';

export interface AuthenticationResult {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

/**
 * Parse query paramers from the redirectCallback url
 *
 * @param {String} url
 * @returns
 */
export const parseRedirectCallback = (url: string): AuthenticationResult => {
  const [, queryString = ''] = url.split('?');
  return qs.parse(queryString);
};
