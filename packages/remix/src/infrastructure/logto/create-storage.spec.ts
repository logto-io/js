import { createSession } from '@remix-run/node';

import { createStorage } from './create-storage.js';

describe('infrastructure:logto:createStorage', () => {
  it('can create a LogtoStorage instance', async () => {
    const session = createSession();
    const storage = createStorage(session);

    expect(storage.constructor.name).toBe('LogtoStorage');
  });

  it('can set items', async () => {
    const session = createSession();
    const storage = createStorage(session);

    await storage.setItem('idToken', 'a');
    await storage.setItem('accessToken', 'b');
    await storage.setItem('refreshToken', 'c');
    await storage.setItem('signInSession', 'd');

    expect(session.data.idToken).toBe('a');
    expect(session.data.accessToken).toBe('b');
    expect(session.data.refreshToken).toBe('c');
    expect(session.data.signInSession).toBe('d');
  });

  it('can remove items', async () => {
    const session = createSession();
    const storage = createStorage(session);

    await storage.setItem('idToken', 'a');
    await storage.setItem('accessToken', 'b');

    await storage.removeItem('accessToken');

    expect(session.data.idToken).toBe('a');
    expect(session.data.accessToken).toBeUndefined();
  });

  it('can get items', async () => {
    const session = createSession();
    const storage = createStorage(session);

    await storage.setItem('accessToken', 'b');

    const accessToken = await storage.getItem('accessToken');
    const refreshToken = await storage.getItem('refreshToken');

    expect(accessToken).toBe('b');
    expect(refreshToken).toBeNull();
  });
});
