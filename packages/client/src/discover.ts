import { z, ZodError } from 'zod';

import { OPError } from './errors';
import { opRequest } from './op-request';

const OIDCConfigurationSchema = z.object({
  authorization_endpoint: z.string(),
  jwks_uri: z.string(),
  token_endpoint: z.string(),
  issuer: z.string(),
  revocation_endpoint: z.string(),
});

export type OIDCConfiguration = z.infer<typeof OIDCConfigurationSchema>;

const appendSlashIfNeeded = (url: string): string => {
  if (url.endsWith('/')) {
    return url;
  }

  return url + '/';
};

export default async function discover(url: string): Promise<OIDCConfiguration> {
  const response = await opRequest.get(
    `${appendSlashIfNeeded(url)}oidc/.well-known/openid-configuration`
  );
  const result = OIDCConfigurationSchema.safeParse(response.data);

  if (!result.success) {
    throw new OPError({ originalError: result.error as ZodError });
  }

  return result.data;
}
