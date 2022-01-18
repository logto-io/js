/** @link [Proof Key for Code Exchange by OAuth Public Clients](https://datatracker.ietf.org/doc/html/rfc7636) */

import { UrlSafeBase64 } from '@silverhand/essentials';
import { fromUint8Array } from 'js-base64';
import { customAlphabet } from 'nanoid';

/**
 * Characters Range of Code Verifier
 *
 * The code verifier is a string only containing the unreserved characters [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~" ( url-safe ) .
 * @link [Client Creates a Code Verifier](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1)
 */
export const CODE_VERIFIER_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

/**
 * Length Range of Code Verifier
 *
 * The length of code verifier ranges from 43 to 128.
 * @link [Client Creates a Code Verifier](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1)
 */
export const CODE_VERIFIER_MAX_LENGTH = 128;

/**
 * @param length The length of the generated string.
 */
function generateRandomString(length: number) {
  return customAlphabet(CODE_VERIFIER_ALPHABET, length)();
}

/**
 * Generates random bytes for state and encodes them in url safe base64
 */
export const generateState = () => generateRandomString(CODE_VERIFIER_MAX_LENGTH);

/**
 * Generates random bytes for nonce and encodes them in url safe base64
 */
export const generateNonce = () => generateRandomString(CODE_VERIFIER_MAX_LENGTH);

/**
 * Generates code verifier
 *
 * @link [Client Creates a Code Verifier](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1)
 */
export const generateCodeVerifier = () => generateRandomString(CODE_VERIFIER_MAX_LENGTH);

/**
 * Calculates the S256 PKCE code challenge for an arbitrary code verifier and encodes it in url safe base64
 *
 * @param {String} codeVerifier Code verifier to calculate the S256 code challenge for
 * @link [Client Creates the Code Challenge](https://datatracker.ietf.org/doc/html/rfc7636#section-4.2)
 */
export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoded = new TextEncoder().encode(codeVerifier);
  const challenge = new Uint8Array(await crypto.subtle.digest('SHA-256', encoded));
  return UrlSafeBase64.replaceNonUrlSafeCharacters(fromUint8Array(challenge));
};
