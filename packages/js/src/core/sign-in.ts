import { QueryKey } from '../consts';
import { withReservedScopes } from '../utils';

const codeChallengeMethod = 'S256';
const prompt = 'consent';
const responseType = 'code';

export type SignInUriParameters = {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
  scopes?: string[];
  resources?: string[];
};

export const generateSignInUri = ({
  authorizationEndpoint,
  clientId,
  redirectUri,
  codeChallenge,
  state,
  scopes,
  resources,
}: SignInUriParameters) => {
  const urlSearchParameters = new URLSearchParams({
    [QueryKey.ClientId]: clientId,
    [QueryKey.RedirectUri]: redirectUri,
    [QueryKey.CodeChallenge]: codeChallenge,
    [QueryKey.CodeChallengeMethod]: codeChallengeMethod,
    [QueryKey.State]: state,
    [QueryKey.ResponseType]: responseType,
    [QueryKey.Prompt]: prompt,
    [QueryKey.Scope]: withReservedScopes(scopes),
  });

  for (const resource of resources ?? []) {
    urlSearchParameters.append(QueryKey.Resource, resource);
  }

  return `${authorizationEndpoint}?${urlSearchParameters.toString()}`;
};
