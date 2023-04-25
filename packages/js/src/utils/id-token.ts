import type { Nullable } from '@silverhand/essentials';
import { urlSafeBase64 } from '@silverhand/essentials';
import type { JWTVerifyGetKey } from 'jose';
import { jwtVerify } from 'jose';

import { isArbitraryObject } from './arbitrary-object.js';
import { LogtoError } from './errors.js';

const issuedAtTimeTolerance = 60;

export type IdTokenClaims = {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  at_hash?: Nullable<string>;
  name?: Nullable<string>;
  username?: Nullable<string>;
  picture?: Nullable<string>;
  email?: Nullable<string>;
  email_verified?: boolean;
  phone_number?: Nullable<string>;
  phone_number_verified?: boolean;
};

/* eslint-disable complexity */
/**
 * @link [ID Token](https://openid.net/specs/openid-connect-core-1_0.html#IDToken)
 */
function assertIdTokenClaims(data: unknown): asserts data is IdTokenClaims {
  if (!isArbitraryObject(data)) {
    throw new TypeError('IdToken is expected to be an object');
  }

  for (const key of ['iss', 'sub', 'aud']) {
    if (typeof data[key] !== 'string') {
      throw new TypeError(`At path: IdToken.${key}: expected a string`);
    }
  }

  for (const key of ['exp', 'iat']) {
    if (typeof data[key] !== 'number') {
      throw new TypeError(`At path: IdToken.${key}: expected a number`);
    }
  }

  for (const key of ['at_hash', 'name', 'username', 'picture', 'email', 'phone_number']) {
    if (data[key] === undefined) {
      continue;
    }

    if (typeof data[key] !== 'string' && data[key] !== null) {
      throw new TypeError(`At path: IdToken.${key}: expected null or a string`);
    }
  }

  for (const key of ['email_verified', 'phone_number_verified']) {
    if (data[key] === undefined) {
      continue;
    }

    if (typeof data[key] !== 'boolean') {
      throw new TypeError(`At path: IdToken.${key}: expected a boolean`);
    }
  }
}
/* eslint-enable complexity */

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
  assertIdTokenClaims(idTokenClaims);

  return idTokenClaims;
};
