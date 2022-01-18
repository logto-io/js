import { SignJWT, generateKeyPair } from 'jose';
import { StructError } from 'superstruct';

import { decodeIdToken } from './id-token';

describe('decodeIdToken', () => {
  test('decoding valid JWT should return claims', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({})
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
    });
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
    expect(() => decodeIdToken('invalid-JWT')).toThrow('invalid token');
  });

  test('decoding valid JWT without issuer should throw StructError', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime('2h')
      .setIssuedAt()
      .sign(privateKey);
    expect(() => decodeIdToken(jwt)).toThrowError(StructError);
  });

  test('decoding valid JWT without subject should throw StructError', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('foo')
      .setAudience('qux')
      .setExpirationTime('2h')
      .setIssuedAt()
      .sign(privateKey);
    expect(() => decodeIdToken(jwt)).toThrowError(StructError);
  });

  test('decoding valid JWT without audience should throw StructError', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('foo')
      .setSubject('bar')
      .setExpirationTime('2h')
      .setIssuedAt()
      .sign(privateKey);
    expect(() => decodeIdToken(jwt)).toThrowError(StructError);
  });

  test('decoding valid JWT without expiration time should throw StructError', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setIssuedAt()
      .sign(privateKey);
    expect(() => decodeIdToken(jwt)).toThrowError(StructError);
  });

  test('decoding valid JWT without issued time should throw StructError', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime('2h')
      .sign(privateKey);
    expect(() => decodeIdToken(jwt)).toThrowError(StructError);
  });
});
