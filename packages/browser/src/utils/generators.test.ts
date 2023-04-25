import { urlSafeBase64 } from '@silverhand/essentials';
import { toUint8Array } from 'js-base64';

import { generateCodeChallenge, generateCodeVerifier, generateState } from './generators.js';

describe('generateState', () => {
  test('should be random value', () => {
    const state1 = generateState();
    const state2 = generateState();
    expect(state1).not.toEqual(state2);
  });

  test('should be url-safe', () => {
    const state = generateState();
    expect(urlSafeBase64.isSafe(state)).toBeTruthy();
  });

  test('raw random data length should be length 64', () => {
    const state = generateState();
    expect(toUint8Array(state).length).toEqual(64);
  });
});

describe('generateCodeVerifier', () => {
  test('should be random value', () => {
    const codeVerifier1 = generateCodeVerifier();
    const codeVerifier2 = generateCodeVerifier();
    expect(codeVerifier1).not.toEqual(codeVerifier2);
  });

  test('should be url-safe', () => {
    const codeVerifier = generateCodeVerifier();
    expect(urlSafeBase64.isSafe(codeVerifier)).toBeTruthy();
  });

  test('raw random data length should be length 64', () => {
    const codeVerifier = generateCodeVerifier();
    expect(toUint8Array(codeVerifier).length).toEqual(64);
  });
});

describe('generateCodeChallenge', () => {
  test('should throw optimized error message when crypto.subtle is unavailable', async () => {
    const originalSubtle = crypto.subtle;
    // @ts-expect-error make it undefined on purpose
    // eslint-disable-next-line @silverhand/fp/no-mutation
    crypto.subtle = undefined;

    const codeVerifier = generateCodeVerifier();
    await expect(generateCodeChallenge(codeVerifier)).rejects.toThrow();

    // @ts-expect-error revert it to the original value
    // eslint-disable-next-line @silverhand/fp/no-mutation
    crypto.subtle = originalSubtle;
  });

  test('dealing with different code verifiers should not be equal', async () => {
    const codeVerifier1 = generateCodeVerifier();
    const codeChallenge1 = await generateCodeChallenge(codeVerifier1);
    const codeVerifier2 = generateCodeVerifier();
    const codeChallenge2 = await generateCodeChallenge(codeVerifier2);
    expect(codeChallenge1).not.toEqual(codeChallenge2);
  });

  test('dealing with same code verifier should be equal', async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge1 = await generateCodeChallenge(codeVerifier);
    const codeChallenge2 = await generateCodeChallenge(codeVerifier);
    expect(codeChallenge1).toEqual(codeChallenge2);
  });

  describe('dealing with static code verifier should not throw', () => {
    test('dealing with url-safe code verifier should not throw', async () => {
      const codeVerifier =
        'tO6MabnMFRAatnlMa1DdSstypzzkgalL1-k8Hr_GdfTj-VXGiEACqAkSkDhFuAuD8FOU8lMishaXjt29Xt2Oww';
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      expect(codeChallenge).toEqual('0K3SLeGlNNzFswYJjcVzcN4C76m_8NZORxFJLBJWGwg');
    });

    describe('dealing with non-url-safe code verifier should not throw', () => {
      test('latin1 character', async () => {
        const codeVerifier = 'Á';
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        expect(codeChallenge).toEqual('p3yvZiKYauPicLIDZ0W1peDz4Z9KFC-9uxtDfoO1KOQ');
      });

      test('emoji character', async () => {
        const codeVerifier = '🚀';
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        expect(codeChallenge).toEqual('67wLKHDrMj8rbP-lxJPO74GufrNq_HPU4DZzAWMdrsU');
      });
    });
  });
});
