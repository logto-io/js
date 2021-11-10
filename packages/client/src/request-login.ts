import qs from 'query-string';

import { generateCodeChallenge, generateCodeVerifier, generateState } from './generators';

export interface LoginPrepareParameters {
  baseUrl: string;
  clientId: string;
  scope?: string;
  redirectUri: string;
}

export const getLoginUrlWithCodeVerifierAndState = async (
  parameters: LoginPrepareParameters
): Promise<{ url: string; codeVerifier: string; state: string }> => {
  const { baseUrl, clientId, scope, redirectUri } = parameters;
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  const url = `${baseUrl}?${qs.stringify({
    client_id: clientId,
    scope,
    response_type: 'code',
    redirect_uri: [redirectUri],
    prompt: 'consent',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  })}`;

  return { url, codeVerifier, state };
};
