import qs from 'query-string';

export const getLogoutUrl = (baseUrl: string, idToken: string, redirectUri: string) => {
  const url = `${baseUrl}?${qs.stringify({
    id_token_hint: idToken,
    post_logout_redirect_uri: redirectUri,
  })}`;

  return url;
};
