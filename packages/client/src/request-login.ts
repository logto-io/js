import qs from 'query-string';

import { generateCodeChallenge, generateCodeVerifier } from './generators';

export const getLoginUrlAndCodeVerifier = (
  baseUrl: string,
  clientId: string,
  redirectUri: string
): { url: string; codeVerifier: string } => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const url = `${baseUrl}?${qs.stringify({
    client_id: clientId,
    scope: 'openid offline_access',
    response_type: 'code',
    redirect_uri: [redirectUri],
    prompt: 'consent',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })}`;

  return { url, codeVerifier };
};
