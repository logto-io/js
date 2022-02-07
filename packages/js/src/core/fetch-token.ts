import { KeysToCamelCase } from '@silverhand/essentials';
import camelcaseKeys from 'camelcase-keys';

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
  scope: string;
  expires_in: number;
};

export type RefreshTokenTokenResponse = KeysToCamelCase<TokenSnakeCaseResponse>;

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

  const tokenSnakeCaseResponse = await requester<TokenSnakeCaseResponse>(tokenEndPoint, {
    method: 'POST',
    headers: ContentType.formUrlEncoded,
    body: parameters,
  });

  return camelcaseKeys(tokenSnakeCaseResponse);
};
