import { CacheKey } from '@logto/client';

import { CacheStorage } from './cache.js';

describe('CacheStorage', () => {
  it('should be able to generate correct cache keys', () => {
    const cache = new CacheStorage('https://example.logto.app/', 'test');

    expect(cache.getKey()).toBe('logto_cache:https%3A%2F%2Fexample.logto.app:test');
    expect(cache.getKey('test')).toBe('logto_cache:https%3A%2F%2Fexample.logto.app:test:test');
    expect(new CacheStorage('https://example.logto.app', 'test').getKey()).toBe(cache.getKey());
    expect(new CacheStorage('https://another.logto.app', 'test').getKey()).not.toBe(cache.getKey());
    expect(new CacheStorage('https://example.logto.app', 'another').getKey()).not.toBe(
      cache.getKey()
    );
  });

  it('should be able to set and get cache', async () => {
    const cache = new CacheStorage('https://example.logto.app', 'test');

    await cache.setItem(CacheKey.Jwks, '{}');
    expect(await cache.getItem(CacheKey.Jwks)).toBe('{}');
  });

  it('should be able to remove cache', async () => {
    const cache = new CacheStorage('https://example.logto.app', 'test');
    await cache.setItem(CacheKey.Jwks, '{}');
    await cache.removeItem(CacheKey.Jwks);
    expect(await cache.getItem(CacheKey.Jwks)).toBeNull();
  });
});
