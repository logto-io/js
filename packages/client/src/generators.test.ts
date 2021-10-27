import { generateCodeVerifier, generateCodeChallenge } from './generators';

test('generate codeVerifier', () => {
  const verifier = generateCodeVerifier();
  expect(verifier.length).toEqual(172);
});

test('generate codeChallenge', async () => {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  expect(challenge.length).toEqual(43);
});
