export interface IDToken {
  /** Issuer Identifier for the Issuer of the response. */
  iss: string;
  /** Subject Identifier */
  sub: string;
  /** Audience(s) that this ID Token is intended for. */
  aud: string | string[];
  /** Expiration time on or after which the ID Token MUST NOT be accepted for processing. */
  exp: number;
  /** Time at which the JWT was issued */
  iat: number;
  /** Access Token hash value */
  at_hash: string;
}
