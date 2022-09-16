import { urlSafeBase64 } from '@silverhand/essentials';
import { jwtVerify, JWTVerifyGetKey } from 'jose';
import * as s from 'superstruct';

import { LogtoError } from './errors';

const issuedAtTimeTolerance = 60;

/**
 * @link [ID Token](https://openid.net/specs/openid-connect-core-1_0.html#IDToken)
 */
const IdTokenClaimsSchema = s.type({
  iss: s.string(),
  sub: s.string(),
  aud: s.string(),
  exp: s.number(),
  iat: s.number(),
  at_hash: s.nullable(s.optional(s.string())),
  name: s.nullable(s.optional(s.string())),
  username: s.nullable(s.optional(s.string())),
  avatar: s.nullable(s.optional(s.string())),
  role_names: s.nullable(s.optional(s.array(s.string()))),
});

export type IdTokenClaims = s.Infer<typeof IdTokenClaimsSchema>;

export const verifyIdToken = async (
  idToken: string,
  clientId: string,
  issuer: string,
  jwks: JWTVerifyGetKey
) => {
  const result = await jwtVerify(idToken, jwks, { audience: clientId, issuer });

  if (Math.abs((result.payload.iat ?? 0) - Date.now() / 1000) > issuedAtTimeTolerance) {
    throw new LogtoError('id_token.invalid_iat');
  }
};

export const decodeIdToken = (token: string): IdTokenClaims => {
  const { 1: encodedPayload } = token.split('.');

  if (!encodedPayload) {
    throw new LogtoError('id_token.invalid_token');
  }

  const json = urlSafeBase64.decode(encodedPayload);
  const idTokenClaims: unknown = JSON.parse(json);
  s.assert(idTokenClaims, IdTokenClaimsSchema);

  return idTokenClaims;
};
