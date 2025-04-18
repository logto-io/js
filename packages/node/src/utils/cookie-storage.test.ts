import { PersistKey } from '@logto/client';

import { type CookieConfig, CookieStorage } from './cookie-storage.js';
import { unwrapSession, wrapSession } from './session.js';

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

const createCookieConfig = (
  encryptionKey: string,
  initialCookies: Record<string, string> = {},
  otherConfigs?: Partial<CookieConfig>
) => {
  const cookies = new Map(Object.entries(initialCookies));
  return {
    encryptionKey,
    getCookie: async (name: string) => cookies.get(name),
    setCookie: async (name: string, value: string) => {
      cookies.set(name, value);
    },
    ...otherConfigs,
  };
};

describe('CookieStorage', () => {
  it('should be able to produce correct configs', () => {
    expect(new TestCookieStorage(createCookieConfig(encryptionKey)).getCookieOptions()).toEqual({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false,
      maxAge: 14 * 24 * 3600,
    });

    expect(
      new TestCookieStorage(
        createCookieConfig(encryptionKey, undefined, { isSecure: true })
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
      })
    );
    await storage.init();
    expect(storage.data).toEqual({ [PersistKey.AccessToken]: 'bar' });
    expect(await storage.getItem(PersistKey.AccessToken)).toEqual('bar');
    expect(await storage.getItem(PersistKey.IdToken)).toBeNull();

    await storage.setItem(PersistKey.AccessToken, 'baz');
    expect(storage.data).toEqual({ [PersistKey.AccessToken]: 'baz' });
    const cookie = await storage.config.getCookie('logtoCookies');
    expect(await unwrapSession(cookie ?? '', encryptionKey)).toEqual({
      [PersistKey.AccessToken]: 'baz',
    });
  });

  it('should be able to remove data', async () => {
    const storage = new TestCookieStorage({
      ...createCookieConfig(encryptionKey, {
        foo: await wrapSession({ [PersistKey.AccessToken]: 'bar' }, encryptionKey),
      }),
      cookieKey: 'foo',
    });
    await storage.init();
    expect(storage.data).toEqual({ [PersistKey.AccessToken]: 'bar' });

    await storage.removeItem(PersistKey.AccessToken);
    expect(storage.data).toEqual({});
    const cookie = await storage.config.getCookie('foo');
    expect(await unwrapSession(cookie ?? '', encryptionKey)).toEqual({});
  });

  it('should support custom sessionWrapper', async () => {
    // Use JSON.stringify/parse to simulate the sessionWrapper
    const mockSessionWrapper = {
      wrap: vi.fn(async (data) => JSON.stringify(data)),
      unwrap: vi.fn(async (data: string) => (data ? JSON.parse(data) : {})),
    };

    const storage = new TestCookieStorage({
      ...createCookieConfig(encryptionKey),
      sessionWrapper: mockSessionWrapper,
    });

    await storage.init();
    await storage.setItem(PersistKey.AccessToken, 'test-token');

    expect(mockSessionWrapper.wrap).toHaveBeenCalled();
    expect(mockSessionWrapper.unwrap).toHaveBeenCalled();
    expect(storage.data).toEqual({ [PersistKey.AccessToken]: 'test-token' });

    const cookie = await storage.config.getCookie('logtoCookies');
    expect(cookie).toBe(JSON.stringify({ [PersistKey.AccessToken]: 'test-token' }));
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
    const storage = new StorageClass(createCookieConfig(encryptionKey));
    await storage.init();
    expect(storage.data).toEqual({});

    await Promise.all([
      storage.setItem(PersistKey.AccessToken, 'foo'),
      delay(async () => storage.setItem(PersistKey.RefreshToken, 'bar'), 1), // Ensure this happens after the first one
      delay(async () => storage.setItem(PersistKey.IdToken, 'baz'), 0),
    ]);

    const result = {
      [PersistKey.AccessToken]: 'foo',
      [PersistKey.RefreshToken]: 'bar',
      [PersistKey.IdToken]: 'baz',
    };
    expect(storage.data).toEqual(result);

    const cookie = await storage.config.getCookie('logtoCookies');
    const unwrapped = await unwrapSession(cookie ?? '', encryptionKey);

    if (StorageClass === NoQueueTestCookieStorage) {
      expect(unwrapped).not.toEqual(result);
    } else {
      expect(unwrapped).toEqual(result);
    }
  });
});
