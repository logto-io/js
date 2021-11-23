import * as s from 'superstruct';

import { LogtoError } from '../modules/errors';
import { createRequester, Requester } from '../utils/requester';

const TokenSetParametersSchema = s.type({
  access_token: s.string(),
  expires_in: s.number(),
  id_token: s.string(),
  refresh_token: s.string(),
});

export type TokenSetParameters = s.Infer<typeof TokenSetParametersSchema>;

type GrantTokenByAuthorizationPayload = {
  endpoint: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
  clientId: string;
};

/**
 * Grant AccessToken & IDToken by Authorization Code
 * @param {Object} payload
 * @param {String} payload.endpoint
 * @param {String} payload.code
 * @param {String} payload.redirectUri
 * @param {String} payload.codeVerifier
 * @param {String} payload.clientId
 * @param requester
 * @returns TokenSetParameters
 * @throws LogtoError
 */
export const grantTokenByAuthorizationCode = async (
  { endpoint, code, redirectUri, codeVerifier, clientId }: GrantTokenByAuthorizationPayload,
  requester: Requester = createRequester()
): Promise<TokenSetParameters> => {
  const parameters = new URLSearchParams();
  parameters.append('grant_type', 'authorization_code');
  parameters.append('code', code);
  parameters.append('redirect_uri', redirectUri);
  parameters.append('code_verifier', codeVerifier);
  parameters.append('client_id', clientId);

  const response = await requester(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: parameters,
  });

  try {
    s.assert(response, TokenSetParametersSchema);
    return response;
  } catch (error: unknown) {
    if (error instanceof s.StructError) {
      throw new LogtoError({ cause: error });
    }

    throw error;
  }
};

type GrantTokenByRefreshTokenPayload = {
  endpoint: string;
  refreshToken: string;
  clientId: string;
};

/**
 * Retrieve access_token by refresh token
 * @param {Object} payload
 * @param {String} payload.endpoint
 * @param {String} payload.cliendId
 * @param requester
 * @returns TokenSetParameters
 * @throws LogtoError
 */
export const grantTokenByRefreshToken = async (
  { endpoint, clientId, refreshToken }: GrantTokenByRefreshTokenPayload,
  requester: Requester = createRequester()
): Promise<TokenSetParameters> => {
  const parameters = new URLSearchParams();
  parameters.append('grant_type', 'refresh_token');
  parameters.append('client_id', clientId);
  parameters.append('refresh_token', refreshToken);

  const response = await requester(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: parameters,
  });

  try {
    s.assert(response, TokenSetParametersSchema);
    return response;
  } catch (error: unknown) {
    if (error instanceof s.StructError) {
      throw new LogtoError({ cause: error });
    }

    throw error;
  }
};
