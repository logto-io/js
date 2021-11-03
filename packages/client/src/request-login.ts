import qs from 'query-string';

import { generateCodeChallenge, generateCodeVerifier } from './generators';

export interface LoginPrepareParameters {
  baseUrl: string;
  clientId: string;
  scope?: string;
  redirectUri: string;
}

export const getLoginUrlAndCodeVerifier = async (
  parameters: LoginPrepareParameters
): Promise<{ url: string; codeVerifier: string }> => {
  const { baseUrl, clientId, scope, redirectUri } = parameters;
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const url = `${baseUrl}?${qs.stringify({
    client_id: clientId,
    scope,
    response_type: 'code',
    redirect_uri: [redirectUri],
    prompt: 'consent',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })}`;

  return { url, codeVerifier };
};
