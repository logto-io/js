/**
 * Code Verifier - Characters Range
 *
 * The code verifier is a string using the unreserved characters [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~" (before base64url-encoding).
 * @link [Client Creates a Code Verifier](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1)
 */
export const CODE_VERIFIER_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

/**
 * Code Verifier - Length Range
 *
 * The length of code verifier ranges from 43 to 128.
 * After base64url-encoding a string of 96 characters, you will get a maximum length (128) string for code verifier.
 * @link [Client Creates a Code Verifier](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1)
 */
export const CODE_VERIFIER_MIN_LENGTH = 43;
export const CODE_VERIFIER_MAX_LENGTH = 128;
export const RANDOM_STRING_MAX_LENGTH = 96;

/**
 * ID Token
 */
export const CLOCK_TOLERANCE = 60;
export const EXPECTED_ALG = 'RS256';

/**
 * Scope - Values
 */
export const EMAIL = 'email';
export const NAME = 'name';
export const OPENID = 'openid';
export const OFFLINE_ACCESS = 'offline_access';

/**
 * Scope - Defaults
 */
export const DEFAULT_SCOPE_STRING = `${OPENID} ${OFFLINE_ACCESS}`;
export const DEFAULT_SCOPE_VALUES = [OPENID, OFFLINE_ACCESS];

/**
 * Session
 */
export const SESSION_MANAGER_KEY = 'LOGTO_SESSION_MANAGER';
export const SESSION_EXPIRES_MILLISECONDS = 86_400_000;

/**
 * Storage
 */
export const STORAGE_KEY_PREFIX = 'logto';
export const TOKEN_SET_CACHE_KEY = 'LOGTO_TOKEN_SET_CACHE';
