import * as crypto from 'crypto';

import { PersistKey } from '@logto/node';

import { unwrapSession, wrapSession } from './session';

const secret = 'secret';

describe('session', () => {
  it('should be able to wrap', async () => {
    const cookie = await wrapSession({ [PersistKey.IdToken]: 'idToken' }, secret, crypto);
    expect(cookie).toContain('.');
  });

  it('should be able to unwrap', async () => {
    const session = await unwrapSession(
      'BShU2NGKg5762PWEOFu8lhzXKZMktgjH1RR4ifik4aGOOerM7w==.DFFnnlzSnjRbTl7I',
      secret,
      crypto
    );
    expect(session[PersistKey.IdToken]).toEqual('idToken');
  });

  it('should be able to wrap and unwrap', async () => {
    const cookie = await wrapSession({ [PersistKey.IdToken]: 'idToken' }, secret, crypto);
    const session = await unwrapSession(cookie, secret, crypto);
    expect(session[PersistKey.IdToken]).toEqual('idToken');
  });
});
