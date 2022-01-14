import { generateCodeVerifier, generateCodeChallenge, generateState } from '@logto/js';
import qs from 'query-string';

export interface LoginPrepareParameters {
  baseUrl: string;
  clientId: string;
  scope?: string;
  redirectUri: string;
}

/**
 * Generate loginUrl
 *
 * @param {Object} parameters
 * @param {String} parameters.baseUrl
 * @param {String} parameters.clientId
 * @param {String} [parameters.scope]
 * @param {String} [parameters.redirectUri]
 * @returns
 */
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

/**
 * Generate Logout Url
 * @param {String} baseUrl
 * @param {String} idToken
 * @param {String} redirectUri
 * @returns
 */
export const getLogoutUrl = (baseUrl: string, idToken: string, redirectUri: string) => {
  const url = `${baseUrl}?${qs.stringify({
    id_token_hint: idToken,
    post_logout_redirect_uri: redirectUri,
  })}`;

  return url;
};
