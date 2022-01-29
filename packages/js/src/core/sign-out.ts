import qs from 'query-string';

export const generateSignOutUri = (
  endSessionEndpoint: string,
  idToken: string,
  postLogoutRedirectUri?: string
) => {
  const parameters = qs.stringify(
    {
      id_token_hint: idToken,
      post_logout_redirect_uri: postLogoutRedirectUri,
    },
    {
      skipNull: true,
    }
  );

  return `${endSessionEndpoint}?${parameters}`;
};
