import { QueryKey } from '../consts';

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
  const urlSearchParameters = new URLSearchParams({ [QueryKey.IdTokenHint]: idToken });

  if (postLogoutRedirectUri) {
    urlSearchParameters.append(QueryKey.PostLogoutRedirectUri, postLogoutRedirectUri);
  }

  return `${endSessionEndpoint}?${urlSearchParameters.toString()}`;
};
