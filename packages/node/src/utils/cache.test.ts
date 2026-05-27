import { CacheKey } from '@logto/client';

import { createMemoryCache } from './cache.js';

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
});
