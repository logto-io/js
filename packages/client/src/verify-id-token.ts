import { createRemoteJWKSet, jwtVerify, JWTVerifyResult, JWTVerifyGetKey } from 'jose';

const EXPECTED_ALG = 'RS256';
const CLOCK_TOLERANCE = 60;

export const createJWKS = (JWKSUri: string): JWTVerifyGetKey => {
  return createRemoteJWKSet(new URL(JWKSUri));
};

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
