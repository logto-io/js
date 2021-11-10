/** @link [Proof Key for Code Exchange by OAuth Public Clients](https://datatracker.ietf.org/doc/html/rfc7636) */

import { UrlSafeBase64 } from '@silverhand/essentials';
import { fromUint8Array } from 'js-base64';
import { customAlphabet } from 'nanoid';

import {
  CODE_VERIFIER_ALPHABET,
  CODE_VERIFIER_MAX_LENGTH,
  DEFAULT_SCOPE_VALUES,
} from './constants';

/**
 * @param length The length of the string to generate.
 */
function generateRandomString(length: number) {
  return customAlphabet(CODE_VERIFIER_ALPHABET, length)();
}

/**
 * Generates random bytes and encodes them in url safe base64.
 */
export const generateState = () => generateRandomString(CODE_VERIFIER_MAX_LENGTH);

/**
 * Generates random bytes and encodes them in url safe base64.
 */
export const generateNonce = () => generateRandomString(CODE_VERIFIER_MAX_LENGTH);

/**
 * Generates code verifier use max_length
 * @link [Client Creates a Code Verifier](https://datatracker.ietf.org/doc/html/rfc7636#section-4.1)
 */
export const generateCodeVerifier = () => generateRandomString(CODE_VERIFIER_MAX_LENGTH);

/**
 * Calculates the S256 PKCE code challenge for an arbitrary code verifier.
 * Encodes in url safe base64.
 * @param codeVerifier Code verifier to calculate the S256 code challenge for
 * @link [Client Creates the Code Challenge](https://datatracker.ietf.org/doc/html/rfc7636#section-4.2)
 */
export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoded = new TextEncoder().encode(codeVerifier);
  const challenge = new Uint8Array(await crypto.subtle.digest('SHA-256', encoded));
  return UrlSafeBase64.replaceNonUrlSafeCharacters(fromUint8Array(challenge));
};

/**
 * @param originalScope
 * @return customScope including all default scope values ( Logto requires `openid` and `offline_access` )
 */
export const generateScope = (originalScope?: string | string[]): string => {
  const originalScopeValues =
    originalScope === undefined
      ? []
      : Array.isArray(originalScope)
      ? originalScope
      : originalScope.split(' ');
  const nonEmptyScopeValues = originalScopeValues.map((s) => s.trim()).filter((s) => s.length > 0);
  const uniqueScopeValues = new Set([...DEFAULT_SCOPE_VALUES, ...nonEmptyScopeValues]);
  return Array.from(uniqueScopeValues).join(' ');
};
