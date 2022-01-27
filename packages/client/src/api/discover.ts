import * as s from 'superstruct';

import { LogtoError } from '../modules/errors';
import { appendSlashIfNeeded } from '../utils';
import { createRequester, Requester } from '../utils/requester';

const OidcConfigResponseSchema = s.type({
  authorization_endpoint: s.string(),
  jwks_uri: s.string(),
  token_endpoint: s.string(),
  issuer: s.string(),
  revocation_endpoint: s.string(),
  end_session_endpoint: s.string(),
});

export type OidcConfigResponse = s.Infer<typeof OidcConfigResponseSchema>;

/**
 * OIDC Connect Discovery: https://openid.net/specs/openid-connect-discovery-1_0.html
 * @param url OpenID provider base url
 * @param requester fetch type requester
 * @returns OidcConfigResponse
 * @throws LogtoError
 */
export async function discover(
  url: string,
  requester: Requester = createRequester()
): Promise<OidcConfigResponse> {
  const response = await requester<OidcConfigResponse>(
    `${appendSlashIfNeeded(url)}oidc/.well-known/openid-configuration`
  );

  try {
    s.assert(response, OidcConfigResponseSchema);

    return response;
  } catch (error: unknown) {
    if (error instanceof s.StructError) {
      throw new LogtoError({ cause: error });
    }

    throw error;
  }
}
