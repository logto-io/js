import { z } from 'zod';

import { requestWithFetch } from './api';
import { LogtoError } from './errors';

const OIDCConfigurationSchema = z.object({
  authorization_endpoint: z.string(),
  jwks_uri: z.string(),
  token_endpoint: z.string(),
  issuer: z.string(),
  revocation_endpoint: z.string(),
  end_session_endpoint: z.string(),
});

export type OIDCConfiguration = z.infer<typeof OIDCConfigurationSchema>;

const appendSlashIfNeeded = (url: string): string => {
  if (url.endsWith('/')) {
    return url;
  }

  return url + '/';
};

export default async function discover(url: string): Promise<OIDCConfiguration> {
  const response = await requestWithFetch<OIDCConfiguration>(
    `${appendSlashIfNeeded(url)}oidc/.well-known/openid-configuration`
  );
  const result = OIDCConfigurationSchema.safeParse(response);

  if (!result.success) {
    throw new LogtoError({ cause: result.error });
  }

  return result.data;
}
