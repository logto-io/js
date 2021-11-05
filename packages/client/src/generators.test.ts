import {
  CODE_VERIFIER_MAX_LENGTH,
  DEFAULT_SCOPE_STRING,
  EMAIL,
  NAME,
  OFFLINE_ACCESS,
  OPENID,
} from './constants';
import { generateCodeChallenge, generateCodeVerifier, generateScope } from './generators';

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
        expect(generateScope(OPENID)).toEqual(DEFAULT_SCOPE_STRING);
      });

      test('with openid name (without default scope value offline_access)', () => {
        expect(generateScope(`${NAME} ${OPENID}`)).toEqual(`${DEFAULT_SCOPE_STRING} ${NAME}`);
      });

      test('with offline_access email (without default scope value openid)', () => {
        expect(generateScope(`${EMAIL} ${OFFLINE_ACCESS}`)).toEqual(
          `${DEFAULT_SCOPE_STRING} ${EMAIL}`
        );
      });

      test('with name email (without all default scope values)', () => {
        const originalScope = `${NAME} ${EMAIL}`;
        expect(generateScope(originalScope)).toEqual(`${DEFAULT_SCOPE_STRING} ${originalScope}`);
      });
    });

    describe('string array param', () => {
      test('empty', () => {
        expect(generateScope([])).toEqual(DEFAULT_SCOPE_STRING);
      });

      test('with openid offline_access', () => {
        expect(generateScope([OPENID, OFFLINE_ACCESS])).toEqual(DEFAULT_SCOPE_STRING);
      });

      test('with openid (without default scope value offline_access)', () => {
        expect(generateScope([OPENID])).toEqual(DEFAULT_SCOPE_STRING);
      });

      test('with openid name (without default scope value offline_access)', () => {
        expect(generateScope([NAME, OPENID])).toEqual(`${DEFAULT_SCOPE_STRING} ${NAME}`);
      });

      test('with offline_access email (without default scope value openid)', () => {
        expect(generateScope([EMAIL, OFFLINE_ACCESS])).toEqual(`${DEFAULT_SCOPE_STRING} ${EMAIL}`);
      });

      test('with name email (without all default scope values)', () => {
        expect(generateScope([NAME, EMAIL])).toEqual(`${DEFAULT_SCOPE_STRING} ${NAME} ${EMAIL}`);
      });
    });
  });
});
