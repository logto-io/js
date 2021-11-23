import { SignJWT, generateKeyPair } from 'jose';

import { nowRoundToSec } from '../utils';
import TokenSet from './token-set';

describe('TokenSet', () => {
  test('sets the expire_at automatically from expires_in', () => {
    const ts = new TokenSet({
      access_token: 'at',
      expires_in: 300,
      refresh_token: 'rt',
      id_token: 'it',
    });

    expect(ts).toHaveProperty('expiresAt', nowRoundToSec() + 300);
    expect(ts).toHaveProperty('expiresIn', 300);
    expect(ts.expired()).toBeFalsy();
  });

  test('expired token sets expires_in to -30', () => {
    const ts = new TokenSet({
      access_token: 'at',
      expires_in: -30,
      refresh_token: 'rt',
      id_token: 'it',
    });

    expect(ts).toHaveProperty('expiresAt', nowRoundToSec() - 30);
    expect(ts).toHaveProperty('expiresIn', 0);
    expect(ts.expired()).toBeTruthy();
  });

  test('provides a #claims getter', async () => {
    const ts = new TokenSet({
      access_token: 'at',
      expires_in: -30,
      refresh_token: 'rt',
      id_token: await new SignJWT({})
        .setProtectedHeader({ alg: 'RS256' })
        .setAudience('foo')
        .setSubject('foz')
        .setIssuer('logto')
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign((await generateKeyPair('RS256')).privateKey),
    });

    expect(ts.claims().aud).toEqual('foo');
    expect(ts.claims().sub).toEqual('foz');
    expect(ts.claims().iss).toEqual('logto');
  });

  test('#claims throws if no id_token is present', () => {
    const ts = new TokenSet({
      access_token: 'at',
      expires_in: 300,
      refresh_token: 'rt',
      id_token: '',
    });

    expect(() => ts.claims()).toThrowError('id_token not present in TokenSet');
  });
});
