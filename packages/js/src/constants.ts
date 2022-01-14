/**
 * Code Verifier - Characters Range
 *
 * The code verifier is a string using the unreserved characters [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~" ( url-safe ) .
 * @link [Client Creates a Code Verifier](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1)
 */
export const CODE_VERIFIER_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

/**
 * Code Verifier - Length Range
 *
 * The length of code verifier ranges from 43 to 128.
 * @link [Client Creates a Code Verifier](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1)
 */
export const CODE_VERIFIER_MIN_LENGTH = 43;
export const CODE_VERIFIER_MAX_LENGTH = 128;

/**
 * Scope - Values
 */
export const NAME = 'name';
export const EMAIL = 'email';
export const OFFLINE_ACCESS = 'offline_access';
export const OPENID = 'openid';

/**
 * Scope - Defaults
 */
export const DEFAULT_SCOPE_STRING = `${OPENID} ${OFFLINE_ACCESS}`;
export const DEFAULT_SCOPE_VALUES = [OPENID, OFFLINE_ACCESS];
