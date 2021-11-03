/** @link [Proof Key for Code Exchange by OAuth Public Clients](https://datatracker.ietf.org/doc/html/rfc7636) */

import { fromUint8Array } from 'js-base64';
import { customAlphabet } from 'nanoid';

import { encodeBase64 } from './utils';

/**
 * The code verifier is a string using the unreserved characters [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~" (before base64url-encoding).
 * @link [Client Creates a Code Verifier](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1)
 */
export const CODE_VERIFIER_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

/**
 * @param length The length of the string to generate.
 */
function generateRandomString(length: number) {
  return customAlphabet(CODE_VERIFIER_ALPHABET, length)();
}

/**
 * The length of code verifier ranges from 43 to 128.
 * @link [Client Creates a Code Verifier](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1)
 */
export const CODE_VERIFIER_MIN_LEN = 43;
export const CODE_VERIFIER_MAX_LEN = 128;

/**
 * Generates random bytes and encodes them in url safe base64.
 * @param length The length of the string (before base64url-encoding) to generate.
 */
export const generateEncodedRandom = (length = CODE_VERIFIER_MAX_LEN) =>
  encodeBase64(generateRandomString(length));

/**
 * Generates random bytes and encodes them in url safe base64.
 */
export const generateState = () => generateEncodedRandom();

/**
 * Generates random bytes and encodes them in url safe base64.
 */
export const generateNonce = () => generateEncodedRandom();

/**
 * Generates code verifier use max_length
 * @link [Client Creates a Code Verifier](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1)
 */
export const generateCodeVerifier = () => generateRandomString(CODE_VERIFIER_MAX_LEN);

/**
 * Calculates the S256 PKCE code challenge for an arbitrary code verifier.
 * Encodes in url safe base64.
 * @param codeVerifier Code verifier to calculate the S256 code challenge for
 * @link [Client Creates the Code Challenge](https://datatracker.ietf.org/doc/html/rfc7636#section-4.2)
 */
export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoded = new TextEncoder().encode(codeVerifier);
  const challenge = new Uint8Array(await crypto.subtle.digest('SHA-256', encoded));
  return fromUint8Array(challenge).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};
