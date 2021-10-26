import { fromUint8Array } from 'js-base64';
import { customAlphabet } from 'nanoid';

import { encodeBase64 } from './utils';

function generateRandomString(length: number) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  return customAlphabet(alphabet, length)();
}

/**
 * @link https://datatracker.ietf.org/doc/html/rfc7636#section-4.1
 */
export const CODE_VERIFIER_MIN_LEN = 43;
export const CODE_VERIFIER_MAX_LEN = 128;

/**
 * Generates random bytes and encodes them in url safe base64.
 * @param length Number indicating the number of bytes to generate.
 */
export const generateRandom = (length = CODE_VERIFIER_MAX_LEN) =>
  encodeBase64(generateRandomString(length));

/**
 * Generates random bytes and encodes them in url safe base64.
 */
export const generateState = () => generateRandom();

/**
 * Generates random bytes and encodes them in url safe base64.
 */
export const generateNonce = () => generateRandom();

/**
 * Generates random bytes and encodes them in url safe base64.
 */
export const generateCodeVerifier = () => generateRandom();

/**
 * Calculates the S256 PKCE code challenge for an arbitrary code verifier.
 * Encodes in url safe base64.
 * @param codeVerifier Code verifier to calculate the S256 code challenge for
 */
export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoded = new TextEncoder().encode(codeVerifier);
  const challenge = new Uint8Array(await crypto.subtle.digest('SHA-256', encoded));
  return fromUint8Array(challenge).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};
