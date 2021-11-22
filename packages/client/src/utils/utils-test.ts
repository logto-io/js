import queryString from 'query-string';

interface CallbackUriParameters {
  redirectUri: string;
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
}

export const generateCallbackUri = ({
  redirectUri,
  code,
  state,
  error,
  errorDescription,
}: CallbackUriParameters): string => {
  return queryString.stringifyUrl(
    {
      url: redirectUri,
      query: { code, state, error, error_description: errorDescription },
    },
    { skipEmptyString: true, sort: false }
  );
};
