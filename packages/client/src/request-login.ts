import qs from 'query-string';

import { generateCodeChallenge, generateCodeVerifier } from './generators';

export const getLoginUrlAndCodeVerifier = async (
  baseUrl: string,
  clientId: string,
  scope: string,
  redirectUri: string
): Promise<{ url: string; codeVerifier: string }> => {
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
