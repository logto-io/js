import qs from 'query-string';

type SignOutUriParameters = {
  endSessionEndpoint: string;
  idToken: string;
  postLogoutRedirectUri?: string;
};

export const generateSignOutUri = ({
  endSessionEndpoint,
  idToken,
  postLogoutRedirectUri,
}: SignOutUriParameters) => {
  const queryString = qs.stringify(
    {
      id_token_hint: idToken,
      post_logout_redirect_uri: postLogoutRedirectUri,
    },
    {
      skipNull: true,
    }
  );

  return `${endSessionEndpoint}?${queryString}`;
};
