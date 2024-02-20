import { PersistKey, unwrapSession, wrapSession } from '@logto/node';
import { type RequestEvent } from '@sveltejs/kit';

import { CookieStorage } from './cookie-storage.js';

const delay = async <T>(function_: () => Promise<T>, ms: number): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(function_());
    }, ms);
  });

class TestCookieStorage extends CookieStorage {
  getCookieOptions() {
    return this.cookieOptions;
  }
}

const encryptionKey = 'foo';

const createMockEvent = (
  initialCookies: Record<string, string> = {},
  url = 'http://localhost/',
  headers = new Map()
): RequestEvent => {
  const cookies = new Map(Object.entries(initialCookies));

  return {
    // @ts-expect-error
    cookies: {
      get: (name: string) => cookies.get(name),
      getAll: () => [...cookies.entries()].map(([name, value]) => ({ name, value })),
      set: (name: string, value: string) => cookies.set(name, value),
      delete: (name: string) => cookies.delete(name),
    },
    request: {
      url,
      // @ts-expect-error
      headers,
    },
  };
};

describe('CookieStorage', () => {
  it('should be able to produce correct configs', () => {
    expect(
      new TestCookieStorage({ requestEvent: createMockEvent(), encryptionKey }).getCookieOptions()
    ).toEqual({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false,
      maxAge: 14 * 24 * 3600,
    });

    expect(
      new TestCookieStorage({
        requestEvent: createMockEvent({}, 'https://localhost/'),
        encryptionKey,
      }).getCookieOptions()
    ).toEqual({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: true,
      maxAge: 14 * 24 * 3600,
    });

    expect(
      new TestCookieStorage({
        requestEvent: createMockEvent({}, undefined, new Map([['x-forwarded-proto', 'https']])),
        encryptionKey,
      }).getCookieOptions()
    ).toEqual({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: true,
      maxAge: 14 * 24 * 3600,
    });
  });

  it('should be able to load and save data', async () => {
    const requestEvent = createMockEvent({
      logtoCookies: await wrapSession({ [PersistKey.AccessToken]: 'bar' }, encryptionKey),
    });
    const storage = new TestCookieStorage({ requestEvent, encryptionKey });
    await storage.init();
    expect(storage.data).toEqual({ [PersistKey.AccessToken]: 'bar' });
    expect(await storage.getItem(PersistKey.AccessToken)).toEqual('bar');
    expect(await storage.getItem(PersistKey.IdToken)).toBeNull();

    await storage.setItem(PersistKey.AccessToken, 'baz');
    expect(storage.data).toEqual({ [PersistKey.AccessToken]: 'baz' });
    expect(await unwrapSession(requestEvent.cookies.get('logtoCookies')!, encryptionKey)).toEqual({
      [PersistKey.AccessToken]: 'baz',
    });
  });

  it('should be able to remove data', async () => {
    const requestEvent = createMockEvent({
      foo: await wrapSession({ [PersistKey.AccessToken]: 'bar' }, encryptionKey),
    });
    const storage = new TestCookieStorage({ requestEvent, encryptionKey, cookieKey: 'foo' });
    await storage.init();
    expect(storage.data).toEqual({ [PersistKey.AccessToken]: 'bar' });

    await storage.removeItem(PersistKey.AccessToken);
    expect(storage.data).toEqual({});
    expect(await unwrapSession(requestEvent.cookies.get('foo')!, encryptionKey)).toEqual({});
  });
});

describe('CookieStorage concurrency', () => {
  class ConcurrentTestCookieStorage extends TestCookieStorage {
    // Simulate encryption delay for testing concurrent updates
    protected override async write(): Promise<void> {
      const staleSessionData = { ...this.sessionData };

      return delay(
        async () => {
          await super.write(staleSessionData);
        },
        this.sessionData.idToken ? 0 : 5 // Ensure other updates are slower than idToken
      );
    }
  }

  class NoQueueTestCookieStorage extends ConcurrentTestCookieStorage {
    protected override async save(): Promise<void> {
      return this.write();
    }
  }

  // For each storage class, test three times to ensure the result is consistent with fixed
  // conditions and random delays.
  it.each([
    ConcurrentTestCookieStorage,
    ConcurrentTestCookieStorage,
    ConcurrentTestCookieStorage,
    NoQueueTestCookieStorage,
    NoQueueTestCookieStorage,
    NoQueueTestCookieStorage,
  ])('should have the expected result [%#]', async (StorageClass) => {
    const randomDelay = async <T>(function_: () => Promise<T>): Promise<T> =>
      delay(function_, Math.random() * 5);
    const requestEvent = createMockEvent({});
    const storage = new StorageClass({ requestEvent, encryptionKey });
    await storage.init();
    expect(storage.data).toEqual({});

    await Promise.all([
      storage.setItem(PersistKey.AccessToken, 'foo'),
      delay(async () => storage.setItem(PersistKey.RefreshToken, 'bar'), 1), // Ensure this happens after the first one
      randomDelay(async () => storage.setItem(PersistKey.IdToken, 'baz')),
      randomDelay(async () => storage.setItem(PersistKey.SignInSession, 'qux')),
    ]);

    const result = {
      [PersistKey.AccessToken]: 'foo',
      [PersistKey.RefreshToken]: 'bar',
      [PersistKey.IdToken]: 'baz',
      [PersistKey.SignInSession]: 'qux',
    };
    expect(storage.data).toEqual(result);

    const unwrapped = await unwrapSession(requestEvent.cookies.get('logtoCookies')!, encryptionKey);

    if (StorageClass === NoQueueTestCookieStorage) {
      expect(unwrapped).not.toEqual(result);
    } else {
      expect(unwrapped).toEqual(result);
    }
  });
});
