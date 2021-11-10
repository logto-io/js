import * as s from 'superstruct';

import { createRequester, Requester } from './api';
import { LogtoError } from './errors';

const OIDCConfigurationSchema = s.type({
  authorization_endpoint: s.string(),
  jwks_uri: s.string(),
  token_endpoint: s.string(),
  issuer: s.string(),
  revocation_endpoint: s.string(),
  end_session_endpoint: s.string(),
});

export type OIDCConfiguration = s.Infer<typeof OIDCConfigurationSchema>;

const appendSlashIfNeeded = (url: string): string => {
  if (url.endsWith('/')) {
    return url;
  }

  return url + '/';
};

export default async function discover(
  url: string,
  requester: Requester = createRequester()
): Promise<OIDCConfiguration> {
  const response = await requester<OIDCConfiguration>(
    `${appendSlashIfNeeded(url)}oidc/.well-known/openid-configuration`
  );

  try {
    s.assert(response, OIDCConfigurationSchema);
    return response;
  } catch (error: unknown) {
    if (error instanceof s.StructError) {
      throw new LogtoError({ cause: error });
    }

    throw error;
  }
}
