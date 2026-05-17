import { PersistKey } from '@logto/client';

import { createKVSessionWrapper, unwrapSession, wrapSession } from './session.js';

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

  it('should be able to wrap and unwrap with kv wrapper', async () => {
    const store = new Map<string, string>();
    const sessionWrapper = createKVSessionWrapper({
      get: async (key) => store.get(key),
      set: async (key, value) => {
        store.set(key, value);
      },
    });

    const cookieValue = await sessionWrapper.wrap({ [PersistKey.IdToken]: 'idToken' }, '');
    const session = await sessionWrapper.unwrap(cookieValue, '');

    expect(session[PersistKey.IdToken]).toEqual('idToken');
  });

  it('should reuse the current kv session id and pass options to the adapter', async () => {
    const store = new Map<string, string>();
    const set = vi.fn(async (key: string, value: string, ttl?: number) => {
      store.set(key, value);
    });
    const sessionWrapper = createKVSessionWrapper(
      {
        get: async (key) => store.get(key) ?? null,
        set,
      },
      {
        keyPrefix: 'custom_prefix_',
        ttl: 123,
      }
    );
    const existingSessionId = 'session-id';
    store.set(
      `custom_prefix_${existingSessionId}`,
      JSON.stringify({ [PersistKey.IdToken]: 'idToken' })
    );

    const session = await sessionWrapper.unwrap(existingSessionId, '');
    const cookieValue = await sessionWrapper.wrap(
      { ...session, [PersistKey.AccessToken]: 'accessToken' },
      '',
      existingSessionId
    );

    expect(cookieValue).toBe(existingSessionId);
    expect(set).toHaveBeenCalledWith(
      `custom_prefix_${existingSessionId}`,
      JSON.stringify({
        [PersistKey.IdToken]: 'idToken',
        [PersistKey.AccessToken]: 'accessToken',
      }),
      123
    );
    expect(JSON.parse(store.get(`custom_prefix_${existingSessionId}`) ?? '')).toEqual({
      [PersistKey.IdToken]: 'idToken',
      [PersistKey.AccessToken]: 'accessToken',
    });
  });

  it.each(['null', '1', '[]'])('should ignore invalid kv session data: %s', async (value) => {
    const sessionWrapper = createKVSessionWrapper({
      get: async () => value,
      set: async () => {
        await Promise.resolve();
      },
    });

    await expect(sessionWrapper.unwrap('session-id', '')).resolves.toEqual({});
  });
});
