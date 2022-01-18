import { UrlSafeBase64 } from '@silverhand/essentials';
import * as s from 'superstruct';

/**
 * @link [ID Token](https://openid.net/specs/openid-connect-core-1_0.html#IDToken)
 */
const IdTokenClaimsSchema = s.type({
  iss: s.string(),
  sub: s.string(),
  aud: s.string(),
  exp: s.number(),
  iat: s.number(),
  at_hash: s.optional(s.string()),
});

export type IdTokenClaims = s.Infer<typeof IdTokenClaimsSchema>;

export const decodeIdToken = (token: string): IdTokenClaims => {
  const { 1: encodedPayload } = token.split('.');
  if (!encodedPayload) {
    throw new Error('invalid token');
  }

  const json = UrlSafeBase64.decode(encodedPayload);
  return s.create(JSON.parse(json), IdTokenClaimsSchema);
};
