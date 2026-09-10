import { CacheKey } from '@logto/browser';

import { ChromeExtensionCacheStorage } from './storage.js';

const sessionStorage = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('chrome', {
    storage: {
      session: sessionStorage,
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ChromeExtensionCacheStorage', () => {
  it('isolates cache keys by normalized endpoint and application', () => {
    const cache = new ChromeExtensionCacheStorage('https://example.logto.app/', 'app-id');

    expect(cache.getKey(CacheKey.OpenidConfig)).toBe(
      'logto_cache:https%3A%2F%2Fexample.logto.app:app-id:openidConfiguration'
    );
    expect(
      new ChromeExtensionCacheStorage('https://example.logto.app', 'app-id').getKey(
        CacheKey.OpenidConfig
      )
    ).toBe(cache.getKey(CacheKey.OpenidConfig));
    expect(
      new ChromeExtensionCacheStorage('https://another.logto.app', 'app-id').getKey(
        CacheKey.OpenidConfig
      )
    ).not.toBe(cache.getKey(CacheKey.OpenidConfig));
    expect(
      new ChromeExtensionCacheStorage('https://example.logto.app', 'another-app').getKey(
        CacheKey.OpenidConfig
      )
    ).not.toBe(cache.getKey(CacheKey.OpenidConfig));
  });

  it('reads, writes, and removes values through chrome.storage.session', async () => {
    const cache = new ChromeExtensionCacheStorage('https://example.logto.app', 'app-id');
    const key = cache.getKey(CacheKey.OpenidConfig);
    sessionStorage.get.mockResolvedValue({ [key]: '{"issuer":"https://example.logto.app"}' });

    await expect(cache.getItem(CacheKey.OpenidConfig)).resolves.toBe(
      '{"issuer":"https://example.logto.app"}'
    );
    await cache.setItem(CacheKey.OpenidConfig, '{}');
    await cache.removeItem(CacheKey.OpenidConfig);

    expect(sessionStorage.get).toHaveBeenCalledWith(key);
    expect(sessionStorage.set).toHaveBeenCalledWith({ [key]: '{}' });
    expect(sessionStorage.remove).toHaveBeenCalledWith(key);
  });
});
