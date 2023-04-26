import { QueryKey } from '../consts/index.js';

type SignOutUriParameters = {
  endSessionEndpoint: string;
  clientId: string;
  postLogoutRedirectUri?: string;
};

export const generateSignOutUri = ({
  endSessionEndpoint,
  clientId,
  postLogoutRedirectUri,
}: SignOutUriParameters) => {
  const urlSearchParameters = new URLSearchParams({ [QueryKey.ClientId]: clientId });

  if (postLogoutRedirectUri) {
    urlSearchParameters.append(QueryKey.PostLogoutRedirectUri, postLogoutRedirectUri);
  }

  return `${endSessionEndpoint}?${urlSearchParameters.toString()}`;
};
