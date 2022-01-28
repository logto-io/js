import qs from 'query-string';

import { withReservedScopes } from '../utils/scopes';

const codeChallengeMethod = 'S256';
const prompt = 'consent';
const responseType = 'authorization_code';

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
}: SignInUriParameters) =>
  `${authorizationEndpoint}?${qs.stringify({
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
    state,
    response_type: responseType,
    prompt,
    scope: withReservedScopes(scopes),
    resource: resources ?? [],
  })}`;
