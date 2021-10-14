import { fromUint8Array } from 'js-base64';

function generateRandomData(length: number) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array);
}

function generateRandomString(length: number) {
  const randomData = generateRandomData(length);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  const charCodes = randomData.map((randomNumber) =>
    alphabet.charCodeAt(randomNumber & alphabet.length)
  );

  return String.fromCharCode(...charCodes);
}

export const CODE_VERIFIER_LEN = 96;
export const generateCodeVerifier = (): string => generateRandomString(CODE_VERIFIER_LEN);

export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoded = new TextEncoder().encode(codeVerifier);
  const challenge = new Uint8Array(await crypto.subtle.digest('SHA-256', encoded));

  return fromUint8Array(challenge).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};
