import { KeysToCamelCase } from '@silverhand/essentials';
import { string, number, assert, type, optional, Infer } from 'superstruct';
import { Except } from 'type-fest';

import { ContentType } from '../consts';
import { createRequester } from '../utils/requester';

export interface FetchTokenByRefreshTokenParameters {
  clientId: string;
  tokenEndPoint: string;
  refreshToken: string;
  resource?: string;
  scope?: string[];
}

const TokenResponseSchema = type({
  access_token: string(),
  refresh_token: string(),
  id_token: string(),
  scope: optional(string()),
  expires_in: number(),
});

export type RefreshTokenTokenResponse = Except<
  KeysToCamelCase<Infer<typeof TokenResponseSchema>>,
  'scope'
> & {
  scope?: string[];
};

export const fetchTokenByRefreshToken = async (
  { clientId, tokenEndPoint, refreshToken, resource, scope }: FetchTokenByRefreshTokenParameters,
  fetchFunction?: typeof fetch
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

  const requester = createRequester(fetchFunction);
  const response = await requester(tokenEndPoint, {
    method: 'POST',
    headers: ContentType.formUrlEncoded,
    body: parameters,
  });

  assert(response, TokenResponseSchema);
  const { access_token, refresh_token, id_token, scope: response_scope, expires_in } = response;

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    idToken: id_token,
    scope: response_scope?.split(' '),
    expiresIn: expires_in,
  };
};
