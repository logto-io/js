import type { Nullable } from '@silverhand/essentials';
import { urlSafeBase64 } from '@silverhand/essentials';
import type { JWTVerifyGetKey } from 'jose';
import { jwtVerify } from 'jose';

import { isArbitraryObject } from './arbitrary-object.js';
import { LogtoError } from './errors.js';

const issuedAtTimeTolerance = 300; // 5 minutes

export type IdTokenClaims = {
  /** Issuer of this token. */
  iss: string;
  /** Subject (the user ID) of this token. */
  sub: string;
  /** Audience (the client ID) of this token. */
  aud: string;
  /** Expiration time of this token. */
  exp: number;
  /** Time at which this token was issued. */
  iat: number;
  at_hash?: Nullable<string>;
  /** Full name of the user. */
  name?: Nullable<string>;
  /** Username of the user. */
  username?: Nullable<string>;
  /** URL of the user's profile picture. */
  picture?: Nullable<string>;
  /** Email address of the user. */
  email?: Nullable<string>;
  /** Whether the user's email address has been verified. */
  email_verified?: boolean;
  /** Phone number of the user. */
  phone_number?: Nullable<string>;
  /** Whether the user's phone number has been verified. */
  phone_number_verified?: boolean;
  /** Organization IDs that the user has membership in. */
  organizations?: string[];
  /**
   * All organization roles that the user has. The format is `{organizationId}:{roleName}`.
   *
   * Note that not all organizations are included in this list, only the ones that the user has roles in.
   *
   * @example
   * ```ts
   * ['org1:admin', 'org2:member'] // The user is an admin of org1 and a member of org2.
   * ```
   */
  organization_roles?: string[];
  /** Roles that the user has for API resources. */
  roles?: string[];
} & Record<string, unknown>;

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
