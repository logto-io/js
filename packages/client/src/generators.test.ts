import { generateCodeVerifier, generateCodeChallenge } from './generators';

test('generate codeVerifier', () => {
  const verifier = generateCodeVerifier();
  expect(verifier.length).toEqual(96);
});

test('generate codeChallenge', () => {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  expect(challenge.length).toEqual(43);
});
