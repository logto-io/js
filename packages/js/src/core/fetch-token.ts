import type { KeysToCamelCase } from '@silverhand/essentials';
import camelcaseKeys from 'camelcase-keys';

import { ContentType, QueryKey, TokenGrantType } from '../consts/index.js';
import type { Requester } from '../types/index.js';

export type FetchTokenByAuthorizationCodeParameters = {
  clientId: string;
  tokenEndpoint: string;
  redirectUri: string;
  codeVerifier: string;
  code: string;
  resource?: string;
};

export type FetchTokenByRefreshTokenParameters = {
  /** The client ID of the application. */
  clientId: string;
  /** The token endpoint of the authorization server. */
  tokenEndpoint: string;
  /** The refresh token to be used to fetch the organization access token. */
  refreshToken: string;
  /** The API resource to be fetch the access token for. */
  resource?: string;
  /** The ID of the organization to be fetch the access token for. */
  organizationId?: string;
  /**
   * The scopes to request for the access token. If not provided, the authorization server
   * will use all the scopes that the client is authorized for.
   */
  scopes?: string[];
};

type SnakeCaseCodeTokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token: string;
  scope: string;
  expires_in: number;
};

export type CodeTokenResponse = KeysToCamelCase<SnakeCaseCodeTokenResponse>;

type SnakeCaseRefreshTokenTokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  scope: string;
  expires_in: number;
};

export type RefreshTokenTokenResponse = KeysToCamelCase<SnakeCaseRefreshTokenTokenResponse>;

export const fetchTokenByAuthorizationCode = async (
  {
    clientId,
    tokenEndpoint,
    redirectUri,
    codeVerifier,
    code,
    resource,
  }: FetchTokenByAuthorizationCodeParameters,
  requester: Requester
): Promise<CodeTokenResponse> => {
  const parameters = new URLSearchParams();
  parameters.append(QueryKey.ClientId, clientId);
  parameters.append(QueryKey.Code, code);
  parameters.append(QueryKey.CodeVerifier, codeVerifier);
  parameters.append(QueryKey.RedirectUri, redirectUri);
  parameters.append(QueryKey.GrantType, TokenGrantType.AuthorizationCode);

  if (resource) {
    parameters.append(QueryKey.Resource, resource);
  }

  const snakeCaseCodeTokenResponse = await requester<SnakeCaseCodeTokenResponse>(tokenEndpoint, {
    method: 'POST',
    headers: ContentType.formUrlEncoded,
    body: parameters,
  });

  return camelcaseKeys(snakeCaseCodeTokenResponse);
};

/**
 * Fetch access token by refresh token using the token endpoint and `refresh_token` grant type.
 * @param params The parameters for fetching access token.
 * @param requester The requester for sending HTTP request.
 * @returns A Promise that resolves to the access token response.
 */
export const fetchTokenByRefreshToken = async (
  params: FetchTokenByRefreshTokenParameters,
  requester: Requester
): Promise<RefreshTokenTokenResponse> => {
  const { clientId, tokenEndpoint, refreshToken, resource, organizationId, scopes } = params;
  const parameters = new URLSearchParams();
  parameters.append(QueryKey.ClientId, clientId);
  parameters.append(QueryKey.RefreshToken, refreshToken);
  parameters.append(QueryKey.GrantType, TokenGrantType.RefreshToken);

  if (resource) {
    parameters.append(QueryKey.Resource, resource);
  }

  if (organizationId) {
    parameters.append(QueryKey.OrganizationId, organizationId);
  }

  if (scopes?.length) {
    parameters.append(QueryKey.Scope, scopes.join(' '));
  }

  const snakeCaseRefreshTokenTokenResponse = await requester<SnakeCaseRefreshTokenTokenResponse>(
    tokenEndpoint,
    {
      method: 'POST',
      headers: ContentType.formUrlEncoded,
      body: parameters,
    }
  );

  return camelcaseKeys(snakeCaseRefreshTokenTokenResponse);
};
