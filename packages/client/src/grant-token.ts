import { z, ZodError } from 'zod';

import { OPError } from './errors';
import { opRequest } from './op-request';

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

  const response = await opRequest.post(endpoint, parameters, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const result = TokenSetParametersSchema.safeParse(response.data);

  if (!result.success) {
    // Will get a lint error without `as ZodError`, weird
    throw new OPError({ originalError: result.error as ZodError });
  }

  return result.data;
};
