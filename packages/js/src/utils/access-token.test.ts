import { generateKeyPair, SignJWT } from 'jose';

import { decodeAccessToken } from './access-token.js';

describe('decodeAccessToken', () => {
  test('decoding valid JWT should return claims', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({ scope: 'read write' })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime(2000)
      .setIssuedAt(1000)
      .sign(privateKey);
    const accessToken = decodeAccessToken(jwt);
    expect(accessToken).toEqual({
      iss: 'foo',
      sub: 'bar',
      aud: 'qux',
      exp: 2000,
      iat: 1000,
      scope: 'read write',
    });
  });

  test('decoding valid JWT with wrong payload type should throw', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const jwt = await new SignJWT({ scope: 123 })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('foo')
      .setSubject('bar')
      .setAudience('qux')
      .setExpirationTime(2000)
      .setIssuedAt(1000)
      .sign(privateKey);
    expect(() => decodeAccessToken(jwt)).toThrowError(TypeError);
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
    const accessToken = decodeAccessToken(jwt);
    expect(accessToken).toEqual({
      iss: 'foo',
      sub: 'bar',
      aud: 'qux',
      exp: 2000,
      iat: 1000,
      foo: 'bar',
    });
  });

  test('decoding invalid JWT string should return empty claims', async () => {
    const claims = decodeAccessToken('invalid-JWT');
    expect(claims).toEqual({});
  });
});
