import { generateCodeVerifier, generateCodeChallenge } from './generators';

test('generate codeVerifier with fixed length', () => {
  const verifier = generateCodeVerifier();
  expect(verifier.length).toEqual(128);
});

test('generate codeVerifier with random value', () => {
  const verifier1 = generateCodeVerifier();
  const verifier2 = generateCodeVerifier();
  expect(verifier1 === verifier2).toBeFalsy();
});

test('generate codeChallenge with fixed length', async () => {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  expect(challenge.length).toEqual(Math.ceil(32 * 1.34));
});

test('generate codeChallenge with different codeVerifier', async () => {
  const verifier1 = generateCodeVerifier();
  const challenge1 = await generateCodeChallenge(verifier1);
  const verifier2 = generateCodeVerifier();
  const challenge2 = await generateCodeChallenge(verifier2);
  expect(challenge1 === challenge2).toBeFalsy();
});

test('generate codeChallenge with same codeVerifier', async () => {
  const verifier = generateCodeVerifier();
  const challenge1 = await generateCodeChallenge(verifier);
  const challenge2 = await generateCodeChallenge(verifier);
  expect(challenge1 === challenge2).toBeTruthy();
});
