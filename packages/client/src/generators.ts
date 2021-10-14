import { fromByteArray } from 'base64-js';
import { sha256 } from 'js-sha256';

function generateRandomData(length: number) {
  // Use web crypto APIs if possible
  if (typeof window !== undefined && window.crypto?.getRandomValues && window.Uint8Array) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array);
  }

  // Fallback to Math random
  return Array.from({ length }).map(() => Math.floor(256 * Math.random()));
}

function generateRandomString(length: number) {
  const randomData = generateRandomData(length);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  const charCodes = randomData.map((randomNumber) =>
    alphabet.charCodeAt(randomNumber & alphabet.length)
  );

  return String.fromCharCode(...charCodes);
}

export const generateCodeVerifier = (): string => generateRandomString(96);

export const generateCodeChallenge = (codeVerifier: string): string => {
  const hashBytes = new Uint8Array(sha256.arrayBuffer(codeVerifier));
  const encodedHash = fromByteArray(hashBytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return encodedHash;
};
