import { generateCodeVerifier, generateCodeChallenge, CODE_VERIFIER_LEN } from './generators';

test('generate codeVerifier', () => {
  const verifier = generateCodeVerifier();
  expect(verifier.length).toEqual(CODE_VERIFIER_LEN);
});

test('generate codeChallenge', async () => {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  expect(challenge.length).toEqual(43);
});
