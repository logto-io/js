import { KeysToCamelCase } from '@silverhand/essentials';
import camelcaseKeys from 'camelcase-keys';
import { Except } from 'type-fest';

import { ContentType } from '../consts';
import { Requester } from '../utils';

export interface FetchTokenByRefreshTokenParameters {
  clientId: string;
  tokenEndPoint: string;
  refreshToken: string;
  resource?: string;
  scope?: string[];
}

type TokenSnakeCaseResponse = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  scope?: string;
  expires_in: number;
};

export type RefreshTokenTokenResponse = {
  scope?: string[];
} & Except<KeysToCamelCase<TokenSnakeCaseResponse>, 'scope'>;

export const fetchTokenByRefreshToken = async (
  { clientId, tokenEndPoint, refreshToken, resource, scope }: FetchTokenByRefreshTokenParameters,
  requester: Requester
): Promise<RefreshTokenTokenResponse> => {
  const parameters = new URLSearchParams();
  parameters.append('client_id', clientId);
  parameters.append('refresh_token', refreshToken);

  if (resource) {
    parameters.append('resource', resource);
  }

  if (scope?.length) {
    parameters.append('scope', scope.join(' '));
  }

  const tokenSnakeCaseResponse = await requester<TokenSnakeCaseResponse>(tokenEndPoint, {
    method: 'POST',
    headers: ContentType.formUrlEncoded,
    body: parameters,
  });

  const scopeValues = tokenSnakeCaseResponse.scope?.split(' ');

  return camelcaseKeys({ ...tokenSnakeCaseResponse, scope: scopeValues });
};
