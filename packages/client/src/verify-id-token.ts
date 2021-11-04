import { createRemoteJWKSet, jwtVerify, JWTVerifyGetKey, JWTVerifyResult } from 'jose';

import { CLOCK_TOLERANCE, EXPECTED_ALG } from './constants';

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
