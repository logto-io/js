import { KeysToCamelCase } from '@silverhand/essentials';
import camelcaseKeys from 'camelcase-keys';

import { createRequester, Requester } from '../utils/requester';

type OidcConfigSnakeCaseResponse = {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint: string;
  revocation_endpoint: string;
  jwks_uri: string;
  issuer: string;
};

export type OidcConfigResponse = KeysToCamelCase<OidcConfigSnakeCaseResponse>;

export const fetchOidcConfig = async (
  endpoint: string,
  requester: Requester = createRequester()
): Promise<OidcConfigResponse> =>
  camelcaseKeys(await requester<OidcConfigSnakeCaseResponse>(endpoint));
