import { CODE_VERIFIER_MAX_LENGTH } from '../constants';
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateNonce,
  generateScope,
  generateState,
} from './generators';
import { ScopeValue, DEFAULT_SCOPE_STRING } from './scope';

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

describe('generateScope', () => {
  describe('Expect generateScope method to append default scope values to the head of scope string', () => {
    describe('undefined param', () => {
      test('should generate DEFAULT_SCOPE_STRING if calling without parameters', () => {
        expect(generateScope()).toEqual(DEFAULT_SCOPE_STRING);
      });
    });

    describe('string param', () => {
      test('empty', () => {
        expect(generateScope('')).toEqual(DEFAULT_SCOPE_STRING);
      });

      test('with blank characters', () => {
        expect(generateScope(' \t')).toEqual(DEFAULT_SCOPE_STRING);
      });

      test('with openid offline_access', () => {
        expect(generateScope(DEFAULT_SCOPE_STRING)).toEqual(DEFAULT_SCOPE_STRING);
      });

      test('with openid (without default scope value offline_access)', () => {
        expect(generateScope(ScopeValue.openid)).toEqual(DEFAULT_SCOPE_STRING);
      });

      test('with openid name (without default scope value offline_access)', () => {
        expect(generateScope(`${ScopeValue.name} ${ScopeValue.openid}`)).toEqual(
          `${DEFAULT_SCOPE_STRING} ${ScopeValue.name}`
        );
      });

      test('with offline_access email (without default scope value openid)', () => {
        expect(generateScope(`${ScopeValue.email} ${ScopeValue.offline_access}`)).toEqual(
          `${DEFAULT_SCOPE_STRING} ${ScopeValue.email}`
        );
      });

      test('with name email (without all default scope values)', () => {
        const originalScope = `${ScopeValue.name} ${ScopeValue.email}`;
        expect(generateScope(originalScope)).toEqual(`${DEFAULT_SCOPE_STRING} ${originalScope}`);
      });
    });

    describe('string array param', () => {
      test('empty', () => {
        expect(generateScope([])).toEqual(DEFAULT_SCOPE_STRING);
      });

      test('with openid offline_access', () => {
        expect(generateScope([ScopeValue.openid, ScopeValue.offline_access])).toEqual(
          DEFAULT_SCOPE_STRING
        );
      });

      test('with openid (without default scope value offline_access)', () => {
        expect(generateScope([ScopeValue.openid])).toEqual(DEFAULT_SCOPE_STRING);
      });

      test('with openid name (without default scope value offline_access)', () => {
        expect(generateScope([ScopeValue.name, ScopeValue.openid])).toEqual(
          `${DEFAULT_SCOPE_STRING} ${ScopeValue.name}`
        );
      });

      test('with offline_access email (without default scope value openid)', () => {
        expect(generateScope([ScopeValue.email, ScopeValue.offline_access])).toEqual(
          `${DEFAULT_SCOPE_STRING} ${ScopeValue.email}`
        );
      });

      test('with name email (without all default scope values)', () => {
        expect(generateScope([ScopeValue.name, ScopeValue.email])).toEqual(
          `${DEFAULT_SCOPE_STRING} ${ScopeValue.name} ${ScopeValue.email}`
        );
      });
    });
  });
});
