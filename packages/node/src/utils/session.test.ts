import { PersistKey } from '@logto/client';

import { unwrapSession, wrapSession } from './session.js';

const secret = 'secret';

describe('session', () => {
  it('should be able to wrap', async () => {
    const cookie = await wrapSession({ [PersistKey.IdToken]: 'idToken' }, secret);
    expect(cookie).toContain('.');
  });

  it('should be able to unwrap', async () => {
    const session = await unwrapSession(
      'BShU2NGKg5762PWEOFu8lhzXKZMktgjH1RR4ifik4aGOOerM7w==.DFFnnlzSnjRbTl7I',
      secret
    );
    expect(session[PersistKey.IdToken]).toEqual('idToken');
  });

  it('should be able to wrap and unwrap', async () => {
    const cookie = await wrapSession({ [PersistKey.IdToken]: 'idToken' }, secret);
    const session = await unwrapSession(cookie, secret);
    expect(session[PersistKey.IdToken]).toEqual('idToken');
  });
});
