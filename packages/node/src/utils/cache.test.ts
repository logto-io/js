import { CacheKey } from '@logto/client';

import { createMemoryCache, resolveAdapterCache } from './cache.js';

describe('createMemoryCache', () => {
  it('should reuse cache storage for the same normalized endpoint', async () => {
    const cache = createMemoryCache('https://logto.dev/');
    const sameEndpointCache = createMemoryCache('https://logto.dev');

    expect(sameEndpointCache).toBe(cache);

    await cache.setItem(CacheKey.OpenidConfig, 'value');
    await expect(sameEndpointCache.getItem(CacheKey.OpenidConfig)).resolves.toBe('value');
  });

  it('should isolate cache data by endpoint', async () => {
    const cache = createMemoryCache('https://logto.dev');
    const anotherEndpointCache = createMemoryCache('https://another.logto.dev');

    await cache.setItem(CacheKey.OpenidConfig, 'value');
    await expect(anotherEndpointCache.getItem(CacheKey.OpenidConfig)).resolves.toBeNull();
  });

  it('should resolve stable, deprecated, and default caches in order', () => {
    const cache = { setItem: vi.fn(), getItem: vi.fn(), removeItem: vi.fn() };
    const unstableCache = { setItem: vi.fn(), getItem: vi.fn(), removeItem: vi.fn() };

    expect(resolveAdapterCache({ cache, unstable_cache: unstableCache }, 'https://logto.dev')).toBe(
      cache
    );
    expect(
      resolveAdapterCache({ cache: undefined, unstable_cache: unstableCache }, 'https://logto.dev')
    ).toBe(unstableCache);
    expect(
      resolveAdapterCache(
        { cache: undefined, unstable_cache: undefined },
        'https://default.logto.dev'
      )
    ).toBe(createMemoryCache('https://default.logto.dev'));
  });
});
