import { SignJWT } from 'jose/jwt/sign';
import { generateKeyPair } from 'jose/util/generate_key_pair';
import { ZodError } from 'zod';

import { decodeToken } from './utils';

describe('decodeToken', () => {
  test('decode token and get claims', async () => {
    const JWT = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setAudience('foo')
      .setSubject('foz')
      .setIssuer('logto')
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign((await generateKeyPair('RS256')).privateKey);
    const payload = decodeToken(JWT);
    expect(payload.sub).toEqual('foz');
  });

  test('throw on invalid JWT string', async () => {
    expect(() => decodeToken('invalid-JWT')).toThrow();
  });

  test('throw ZodError when iss is missing', async () => {
    const JWT = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setAudience('foo')
      .setSubject('foz')
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign((await generateKeyPair('RS256')).privateKey);
    expect(() => decodeToken(JWT)).toThrowError(ZodError);
  });
});
