import { generateKeyPair, SignJWT } from 'jose';

import { LogtoError } from './errors.js';
import { decodeIdToken } from './id-token.js';

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
    expect(() => decodeIdToken('invalid-JWT')).toThrow(new LogtoError('id_token.invalid_token'));
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
