import { createRemoteJWKSet, jwtVerify, JWTVerifyGetKey, JWTVerifyResult } from 'jose';
import * as s from 'superstruct';

import { CLOCK_TOLERANCE, EXPECTED_ALG } from '../constants';

const fullfillBase64 = (input: string) => {
  if (input.length === 2) {
    return `${input}==`;
  }

  if (input.length === 3) {
    return `${input}=`;
  }

  return input;
};

const IdTokenClaimsSchema = s.type({
  iss: s.string(),
  sub: s.string(),
  aud: s.string(),
  exp: s.number(),
  iat: s.number(),
  auth_time: s.optional(s.number()),
  nonce: s.optional(s.string()),
  acr: s.optional(s.string()),
  amr: s.optional(s.array(s.string())),
  azp: s.optional(s.string()),
  at_hash: s.optional(s.string()),
  c_hash: s.optional(s.string()),
});

export type IdTokenClaims = s.Infer<typeof IdTokenClaimsSchema>;

/**
 * Decode ID Token from JWT, without verifying.
 * Verifying JWT requires fetching public key first, this can not
 * be done in a sync function, in some cases, verifying is not necessary.
 * @param token JWT string.
 * @returns IDToken combined with JWT Claims.
 */
export const decodeIdToken = (token: string): IdTokenClaims => {
  const payloadPart = token.split('.')[1];

  if (!payloadPart) {
    throw new Error('invalid token');
  }

  const payloadString = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    escape(Buffer.from(fullfillBase64(payloadString), 'base64').toString())
  );

  try {
    // Using SuperStruct to validate the json type
    const idToken = JSON.parse(json) as IdTokenClaims;
    s.assert(idToken, IdTokenClaimsSchema);
    return idToken;
  } catch (error: unknown) {
    if (error instanceof s.StructError) {
      throw error;
    }

    throw new Error('invalid token: JSON parse failed');
  }
};

/**
 * Create JWKS
 *
 * @param JWKSUri
 * @returns
 */
export const createJWKS = (JWKSUri: string): JWTVerifyGetKey => {
  return createRemoteJWKSet(new URL(JWKSUri));
};

/**
 * Verify ID Token
 * @param {Function} JWKS
 * @param {String} idToken
 * @param {String} audience
 * @returns
 */
export const verifyIdToken = async (
  JWKS: JWTVerifyGetKey,
  idToken: string,
  audience: string
): Promise<JWTVerifyResult> => {
  return jwtVerify(idToken, JWKS, {
    algorithms: [EXPECTED_ALG],
    clockTolerance: CLOCK_TOLERANCE,
    audience,
  });
};
