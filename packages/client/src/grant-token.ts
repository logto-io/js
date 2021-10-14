import axios from 'axios';
import { z } from 'zod';

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

  const { data } = await axios.post<TokenSetParameters>(endpoint, parameters, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return TokenSetParametersSchema.parse(data);
};
