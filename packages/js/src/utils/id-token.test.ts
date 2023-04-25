import { createRemoteJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import nock from 'nock';

import { LogtoError } from './errors.js';
import { decodeIdToken, verifyIdToken } from './id-token.js';

const createDefaultJwks = () => createRemoteJWKSet(new URL('https://logto.dev/oidc/jwks'));

const mockJwkResponse = (key: unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (global.window === undefined) {
    // Mock in Node env
    nock('https://logto.dev', { allowUnmocked: true })
      .get('/oidc/jwks')
      .reply(200, { keys: [key] });
  } else {
    // Mock in JSDOM env
    // @ts-expect-error for testing
    // eslint-disable-next-line @silverhand/fp/no-mutation
    global.fetch = jest.fn(async () => ({
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
      .setExpirationTime(Date.now() / 1000 - 1)
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
      .setIssuedAt(Date.now() / 1000 - 180)
      .sign(privateKey);

    const jwks = createDefaultJwks();

    await expect(verifyIdToken(idToken, 'qux', 'foo', jwks)).rejects.toMatchError(
      new LogtoError('id_token.invalid_iat')
    );
  });
});

describe('decodeIdToken', () => {
  test('decoding valid JWT should return claims', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({ name: '测试用户', avatar: undefined })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime(2000)
      .setIssuedAt(1000)
      .sign(privateKey);
    const idTokenClaims = decodeIdToken(jwt);
    expect(idTokenClaims).toEqual({
      iss: 'foo',
      sub: 'bar',
      aud: 'qux',
      exp: 2000,
      iat: 1000,
      name: '测试用户',
    });
  });

  test('decoding valid JWT with wrong payload type should throw', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({ name: null, avatar: undefined, at_hash: 123 })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime(2000)
      .setIssuedAt(1000)
      .sign(privateKey);
    expect(() => decodeIdToken(jwt)).toThrowError(TypeError);
  });

  test('decoding valid JWT with non-predefined claims should return all claims', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const payloadWithNonPredefinedClaims = { foo: 'bar' };
    const jwt = await new SignJWT(payloadWithNonPredefinedClaims)
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime(2000)
      .setIssuedAt(1000)
      .sign(privateKey);
    const idTokenClaims = decodeIdToken(jwt);
    expect(idTokenClaims).toEqual({
      iss: 'foo',
      sub: 'bar',
      aud: 'qux',
      exp: 2000,
      iat: 1000,
      foo: 'bar',
    });
  });

  test('decoding invalid JWT string should throw Error', async () => {
    expect(() => decodeIdToken('invalid-JWT')).toMatchError(
      new LogtoError('id_token.invalid_token')
    );
  });

  test('decoding valid JWT without issuer should throw TypeError', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime('2h')
      .setIssuedAt()
      .sign(privateKey);
    expect(() => decodeIdToken(jwt)).toThrowError(TypeError);
  });

  test('decoding valid JWT without subject should throw TypeError', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('foo')
      .setAudience('qux')
      .setExpirationTime('2h')
      .setIssuedAt()
      .sign(privateKey);
    expect(() => decodeIdToken(jwt)).toThrowError(TypeError);
  });

  test('decoding valid JWT without audience should throw TypeError', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('foo')
      .setSubject('bar')
      .setExpirationTime('2h')
      .setIssuedAt()
      .sign(privateKey);
    expect(() => decodeIdToken(jwt)).toThrowError(TypeError);
  });

  test('decoding valid JWT without expiration time should throw TypeError', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setIssuedAt()
      .sign(privateKey);
    expect(() => decodeIdToken(jwt)).toThrowError(TypeError);
  });

  test('decoding valid JWT without issued at time should throw TypeError', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime('2h')
      .sign(privateKey);
    expect(() => decodeIdToken(jwt)).toThrowError(TypeError);
  });
});
