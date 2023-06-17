import { CacheKey } from '@logto/client';

import { CacheStorage } from './cache.js';

describe('CacheStorage', () => {
  it('should be able to generate correct cache keys', () => {
    const cache = new CacheStorage('test');

    expect(cache.getKey()).toBe('logto_cache:test');
    expect(cache.getKey('test')).toBe('logto_cache:test:test');
  });

  it('should be able to set and get cache', async () => {
    const cache = new CacheStorage('test');

    await cache.setItem(CacheKey.Jwks, '{}');
    expect(await cache.getItem(CacheKey.Jwks)).toBe('{}');
  });

  it('should be able to remove cache', async () => {
    const cache = new CacheStorage('test');
    await cache.setItem(CacheKey.Jwks, '{}');
    await cache.removeItem(CacheKey.Jwks);
    expect(await cache.getItem(CacheKey.Jwks)).toBeNull();
  });
});
