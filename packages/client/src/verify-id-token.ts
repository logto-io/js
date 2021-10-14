import { createRemoteJWKSet } from 'jose/jwks/remote';
import { jwtVerify } from 'jose/jwt/verify';
import { FlattenedJWSInput, GetKeyFunction, JWSHeaderParameters } from 'jose/webcrypto/types';

const EXPECTED_ALG = 'RS256';
const CLOCK_TOLERANCE = 60;

export const createJWKS = (JWKSUri: string) => {
  return createRemoteJWKSet(new URL(JWKSUri));
};

export const verifyIdToken = async (
  JWKS: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>,
  idToken: string,
  audience: string
): Promise<void> => {
  await jwtVerify(idToken, JWKS, {
    algorithms: [EXPECTED_ALG],
    clockTolerance: CLOCK_TOLERANCE,
    audience,
  });
};
