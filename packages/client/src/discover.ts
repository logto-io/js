import axios from 'axios';
import { z } from 'zod';

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
  const { data } = await axios.get<OIDCConfiguration>(
    `${appendSlashIfNeeded(url)}oidc/.well-known/openid-configuration`
  );
  return OIDCConfigurationSchema.parse(data);
}
