import { PersistKey, unwrapSession, wrapSession } from '@logto/node';

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

const createCookieConfig = (encryptionKey: string, initialCookies: Record<string, string> = {}) => {
  const cookies = new Map(Object.entries(initialCookies));
  return {
    encryptionKey,
    getCookie: (name: string) => cookies.get(name),
    setCookie: (name: string, value: string) => cookies.set(name, value),
  };
};

const createPartialRequest = (url = 'http://localhost/', headers = new Headers()) => ({
  headers,
  url,
});

describe('CookieStorage', () => {
  it('should be able to produce correct configs', () => {
    expect(
      new TestCookieStorage(
        createCookieConfig(encryptionKey),
        createPartialRequest()
      ).getCookieOptions()
    ).toEqual({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false,
      maxAge: 14 * 24 * 3600,
    });

    expect(
      new TestCookieStorage(
        createCookieConfig(encryptionKey),
        createPartialRequest('https://localhost/')
      ).getCookieOptions()
    ).toEqual({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: true,
      maxAge: 14 * 24 * 3600,
    });

    expect(
      new TestCookieStorage(
        createCookieConfig(encryptionKey),
        createPartialRequest(undefined, new Headers({ 'x-forwarded-proto': 'https' }))
      ).getCookieOptions()
    ).toEqual({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: true,
      maxAge: 14 * 24 * 3600,
    });
  });

  it('should be able to load and save data', async () => {
    const storage = new TestCookieStorage(
      createCookieConfig(encryptionKey, {
        logtoCookies: await wrapSession({ [PersistKey.AccessToken]: 'bar' }, encryptionKey),
      }),
      createPartialRequest()
    );
    await storage.init();
    expect(storage.data).toEqual({ [PersistKey.AccessToken]: 'bar' });
    expect(await storage.getItem(PersistKey.AccessToken)).toEqual('bar');
    expect(await storage.getItem(PersistKey.IdToken)).toBeNull();

    await storage.setItem(PersistKey.AccessToken, 'baz');
    expect(storage.data).toEqual({ [PersistKey.AccessToken]: 'baz' });
    expect(await unwrapSession(storage.config.getCookie('logtoCookies')!, encryptionKey)).toEqual({
      [PersistKey.AccessToken]: 'baz',
    });
  });

  it('should be able to remove data', async () => {
    const storage = new TestCookieStorage(
      {
        ...createCookieConfig(encryptionKey, {
          foo: await wrapSession({ [PersistKey.AccessToken]: 'bar' }, encryptionKey),
        }),
        cookieKey: 'foo',
      },
      createPartialRequest()
    );
    await storage.init();
    expect(storage.data).toEqual({ [PersistKey.AccessToken]: 'bar' });

    await storage.removeItem(PersistKey.AccessToken);
    expect(storage.data).toEqual({});
    expect(await unwrapSession(storage.config.getCookie('foo')!, encryptionKey)).toEqual({});
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

    const storage = new StorageClass(createCookieConfig(encryptionKey), createPartialRequest());
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

    const unwrapped = await unwrapSession(storage.config.getCookie('logtoCookies')!, encryptionKey);

    if (StorageClass === NoQueueTestCookieStorage) {
      expect(unwrapped).not.toEqual(result);
    } else {
      expect(unwrapped).toEqual(result);
    }
  });
});
