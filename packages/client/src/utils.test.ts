import { SignJWT } from 'jose/jwt/sign';
import { generateKeyPair } from 'jose/util/generate_key_pair';

import { decodeToken } from './utils';

describe('decodeToken', () => {
  test('decode token and get claims', async () => {
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setAudience('foo')
      .setSubject('foz')
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign((await generateKeyPair('RS256')).privateKey);
    const payload = decodeToken(jwt);
    expect(payload.sub).toEqual('foz');
  });

  test('throw on invalid jwt string', async () => {
    expect(() => decodeToken('invalid-jwt')).toThrow();
  });
});
