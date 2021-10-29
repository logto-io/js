import { z } from 'zod';

import { requestWithFetch } from './api';
import { LogtoError } from './errors';

const TokenSetParametersSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  id_token: z.string(),
  refresh_token: z.string(),
});

export type TokenSetParameters = z.infer<typeof TokenSetParametersSchema>;

export const grantTokenByAuthorizationCode = async (
  endpoint: string,
  code: string,
  redirectUri: string,
  codeVerifier: string
): Promise<TokenSetParameters> => {
  const parameters = new URLSearchParams();
  parameters.append('grant_type', 'authorization_code');
  parameters.append('code', code);
  parameters.append('redirect_uri', redirectUri);
  parameters.append('code_verifier', codeVerifier);

  const response = await requestWithFetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: parameters,
  });
  const result = TokenSetParametersSchema.safeParse(response);

  if (!result.success) {
    throw new LogtoError({ cause: result.error });
  }

  return result.data;
};

export const grantTokenByRefreshToken = async (
  endpoint: string,
  clientId: string,
  refreshToken: string
): Promise<TokenSetParameters> => {
  const parameters = new URLSearchParams();
  parameters.append('grant_type', 'refresh_token');
  parameters.append('client_id', clientId);
  parameters.append('refresh_token', refreshToken);

  const response = await requestWithFetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: parameters,
  });
  const result = TokenSetParametersSchema.safeParse(response);

  if (!result.success) {
    throw new LogtoError({ cause: result.error });
  }

  return result.data;
};
