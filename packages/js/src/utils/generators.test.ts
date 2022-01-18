import {
  CODE_VERIFIER_MAX_LENGTH,
  generateCodeChallenge,
  generateCodeVerifier,
  generateNonce,
  generateState,
} from './generators';

describe('generateState', () => {
  test('with fixed length', () => {
    const state = generateState();
    expect(state.length).toEqual(CODE_VERIFIER_MAX_LENGTH);
  });

  test('with random value', () => {
    const state1 = generateState();
    const state2 = generateState();
    expect(state1).not.toEqual(state2);
  });
});

describe('generateNonce', () => {
  test('with fixed length', () => {
    const nonce = generateNonce();
    expect(nonce.length).toEqual(CODE_VERIFIER_MAX_LENGTH);
  });

  test('with random value', () => {
    const nonce1 = generateNonce();
    const nonce2 = generateNonce();
    expect(nonce1).not.toEqual(nonce2);
  });
});

describe('generateCodeVerifier', () => {
  test('with fixed length', () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toEqual(CODE_VERIFIER_MAX_LENGTH);
  });

  test('with random value', () => {
    const verifier1 = generateCodeVerifier();
    const verifier2 = generateCodeVerifier();
    expect(verifier1).not.toEqual(verifier2);
  });
});

describe('generateCodeChallenge', () => {
  test('with fixed length', async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    expect(challenge.length).toEqual(Math.ceil(32 * 1.34));
  });

  test('with different codeVerifier', async () => {
    const verifier1 = generateCodeVerifier();
    const challenge1 = await generateCodeChallenge(verifier1);
    const verifier2 = generateCodeVerifier();
    const challenge2 = await generateCodeChallenge(verifier2);
    expect(challenge1).not.toEqual(challenge2);
  });

  test('with same codeVerifier', async () => {
    const verifier = generateCodeVerifier();
    const challenge1 = await generateCodeChallenge(verifier);
    const challenge2 = await generateCodeChallenge(verifier);
    expect(challenge1).toEqual(challenge2);
  });
});
