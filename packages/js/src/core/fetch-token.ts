import { KeysToCamelCase } from '@silverhand/essentials';
import camelcaseKeys from 'camelcase-keys';
import { Except } from 'type-fest';

import { ContentType } from '../consts';
import { Requester } from '../utils';

export type FetchTokenByRefreshTokenParameters = {
  clientId: string;
  tokenEndPoint: string;
  refreshToken: string;
  resource?: string;
  scopes?: string[];
};

type TokenSnakeCaseResponse = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  scope?: string;
  expires_in: number;
};

const requestToken = async (
  tokenEndpoint: string,
  parameters: URLSearchParams,
  requester: Requester
) => {
  const tokenSnakeCaseResponse = await requester<TokenSnakeCaseResponse>(tokenEndpoint, {
    method: 'POST',
    headers: ContentType.formUrlEncoded,
    body: parameters,
  });

  const scopeValues = tokenSnakeCaseResponse.scope?.split(' ');

  return camelcaseKeys({ ...tokenSnakeCaseResponse, scopes: scopeValues });
};

export type RefreshTokenTokenResponse = {
  scopes?: string[];
} & Except<KeysToCamelCase<TokenSnakeCaseResponse>, 'scope'>;

export const fetchTokenByRefreshToken = async (
  { clientId, tokenEndPoint, refreshToken, resource, scopes }: FetchTokenByRefreshTokenParameters,
  requester: Requester
): Promise<RefreshTokenTokenResponse> => {
  const parameters = new URLSearchParams();
  parameters.append('client_id', clientId);
  parameters.append('refresh_token', refreshToken);

  if (resource) {
    parameters.append('resource', resource);
  }

  if (scopes?.length) {
    parameters.append('scope', scopes.join(' '));
  }

  return requestToken(tokenEndPoint, parameters, requester);
};

export type FetchTokenByAuthorizationCodeParameters = {
  tokenEndpoint: string;
  code: string;
  codeVerifier: string;
  clientId: string;
  redirectUri: string;
  resource?: string;
  requester: Requester;
};

export type CodeTokenResponse = RefreshTokenTokenResponse;

export const fetchTokenByAuthorizationCode = async ({
  tokenEndpoint,
  code,
  codeVerifier,
  clientId,
  redirectUri,
  resource,
  requester,
}: FetchTokenByAuthorizationCodeParameters): Promise<CodeTokenResponse> => {
  const parameters = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    code_verifier: codeVerifier,
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  if (resource) {
    parameters.append('resource', resource);
  }

  return requestToken(tokenEndpoint, parameters, requester);
};
