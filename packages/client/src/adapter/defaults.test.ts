import { LogtoError } from '@logto/js';
import { createRemoteJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';

import { nocked } from '../mock.js';

import { verifyIdToken } from './defaults.js';

const createDefaultJwks = () => createRemoteJWKSet(new URL('https://logto.dev/oidc/jwks'));

const mockJwkResponse = (key: unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (global.window === undefined) {
    // Mock in Node env
    nocked.get('/oidc/jwks').reply(200, { keys: [key] });
  } else {
    // Mock in JSDOM env
    // @ts-expect-error for testing
    // eslint-disable-next-line @silverhand/fp/no-mutation
    global.fetch = vi.fn(async () => ({
      status: 200,
      json: async () => ({ keys: [key] }),
    }));
  }
};

describe('verifyIdToken', () => {
  test('valid ID Token, signed by RS256 algorithm, should not throw', async () => {
    const alg = 'RS256';
    const { privateKey, publicKey } = await generateKeyPair(alg);

    mockJwkResponse(await exportJWK(publicKey));

    const idToken = await new SignJWT({})
      .setProtectedHeader({ alg })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime('2h')
      .setIssuedAt()
      .sign(privateKey);

    const jwks = createDefaultJwks();

    await expect(verifyIdToken(idToken, 'qux', 'foo', jwks)).resolves.not.toThrow();
  });

  test('valid ID Token, signed by ES512 algorithm, should not throw', async () => {
    const alg = 'ES512';
    const { privateKey, publicKey } = await generateKeyPair(alg);

    mockJwkResponse(await exportJWK(publicKey));

    const idToken = await new SignJWT({})
      .setProtectedHeader({ alg })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime('2h')
      .setIssuedAt()
      .sign(privateKey);

    const jwks = createDefaultJwks();

    await expect(verifyIdToken(idToken, 'qux', 'foo', jwks)).resolves.not.toThrow();
  });

  test('mismatched signature should throw', async () => {
    const alg = 'RS256';
    const { privateKey } = await generateKeyPair(alg);
    const { publicKey } = await generateKeyPair(alg);

    mockJwkResponse(await exportJWK(publicKey));

    const idToken = await new SignJWT({})
      .setProtectedHeader({ alg })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('foz')
      .setExpirationTime('2h')
      .setIssuedAt()
      .sign(privateKey);

    const jwks = createDefaultJwks();

    await expect(verifyIdToken(idToken, 'foo', 'baz', jwks)).rejects.toThrowError(
      'signature verification failed'
    );
  });

  test('mismatched issuer should throw', async () => {
    const alg = 'RS256';
    const { privateKey, publicKey } = await generateKeyPair(alg);

    mockJwkResponse(await exportJWK(publicKey));

    const idToken = await new SignJWT({})
      .setProtectedHeader({ alg })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime('2h')
      .setIssuedAt()
      .sign(privateKey);

    const jwks = createDefaultJwks();

    await expect(verifyIdToken(idToken, 'qux', 'xxx', jwks)).rejects.toThrowError(
      'unexpected "iss" claim value'
    );
  });

  test('mismatched audience should throw', async () => {
    const alg = 'RS256';
    const { privateKey, publicKey } = await generateKeyPair(alg);

    mockJwkResponse(await exportJWK(publicKey));

    const idToken = await new SignJWT({})
      .setProtectedHeader({ alg })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime('2h')
      .setIssuedAt()
      .sign(privateKey);

    const jwks = createDefaultJwks();

    await expect(verifyIdToken(idToken, 'xxx', 'foo', jwks)).rejects.toThrowError(
      'unexpected "aud" claim value'
    );
  });

  test('expired ID Token should throw', async () => {
    const alg = 'RS256';
    const { privateKey, publicKey } = await generateKeyPair(alg);

    mockJwkResponse(await exportJWK(publicKey));

    const idToken = await new SignJWT({})
      .setProtectedHeader({ alg })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime(Date.now() / 1000 - 301)
      .setIssuedAt()
      .sign(privateKey);

    const jwks = createDefaultJwks();

    await expect(verifyIdToken(idToken, 'qux', 'foo', jwks)).rejects.toThrowError(
      '"exp" claim timestamp check failed'
    );
  });

  test('issued at time, too far away from current time, should throw', async () => {
    const alg = 'RS256';
    const { privateKey, publicKey } = await generateKeyPair(alg);

    mockJwkResponse(await exportJWK(publicKey));

    const idToken = await new SignJWT({})
      .setProtectedHeader({ alg })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime('2h')
      .setIssuedAt(Date.now() / 1000 - 301)
      .sign(privateKey);

    const jwks = createDefaultJwks();

    await expect(verifyIdToken(idToken, 'qux', 'foo', jwks)).rejects.toMatchObject(
      new LogtoError('id_token.invalid_iat')
    );
  });

  test('issued at time within clock tolerance should not throw', async () => {
    const alg = 'RS256';
    const { privateKey, publicKey } = await generateKeyPair(alg);

    mockJwkResponse(await exportJWK(publicKey));

    const idToken = await new SignJWT({})
      .setProtectedHeader({ alg })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime('2h')
      .setIssuedAt(Date.now() / 1000 - 3599)
      .sign(privateKey);

    const jwks = createDefaultJwks();

    await expect(verifyIdToken(idToken, 'qux', 'foo', jwks, 3600)).resolves.not.toThrow();
  });
});
