import type { Requester } from '@logto/js';

import { createAdapters, MockedStorage } from '../mock.js';

import { CacheKey, type ClientAdapter, ClientAdapterInstance, PersistKey } from './index.js';

const createAdapterWithoutTransport = (): ClientAdapter => {
  const adapters = createAdapters();

  return {
    storage: adapters.storage,
    navigate: adapters.navigate,
    generateState: adapters.generateState,
    generateCodeVerifier: adapters.generateCodeVerifier,
    generateCodeChallenge: adapters.generateCodeChallenge,
  };
};

describe('ClientAdapterInstance', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses native fetch when no transport is provided', async () => {
    const fetchTransport = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json({ source: 'native' }));
    const adapterInstance = new ClientAdapterInstance(createAdapterWithoutTransport());

    await expect(adapterInstance.requester('https://logto.example.com')).resolves.toEqual({
      source: 'native',
    });
    expect(fetchTransport).toHaveBeenCalledOnce();
  });

  it('preserves a legacy requester without applying request options', () => {
    const legacyRequester = vi.fn() as unknown as Requester;
    const adapterInstance = new ClientAdapterInstance(
      {
        ...createAdapterWithoutTransport(),
        requester: legacyRequester,
      },
      { requestTimeoutMs: 1000 }
    );

    expect(adapterInstance.requester).toBe(legacyRequester);
  });

  it('prefers fetch when both fetch and a legacy requester are provided', async () => {
    const legacyRequester = vi.fn() as unknown as Requester;
    const fetchTransport = vi.fn(async () => Response.json({ source: 'fetch' }));
    const adapterInstance = new ClientAdapterInstance({
      ...createAdapters(),
      fetch: fetchTransport,
      requester: legacyRequester,
    });

    await expect(adapterInstance.requester('https://logto.example.com')).resolves.toEqual({
      source: 'fetch',
    });
    expect(fetchTransport).toHaveBeenCalledOnce();
    expect(legacyRequester).not.toHaveBeenCalled();
  });

  it('should be able to set storage item', async () => {
    const adapterInstance = new ClientAdapterInstance(createAdapters(true));
    await adapterInstance.setStorageItem(PersistKey.AccessToken, 'value');
    expect(await adapterInstance.storage.getItem(PersistKey.AccessToken)).toBe('value');
  });

  it('should be able to remove storage item', async () => {
    const adapterInstance = new ClientAdapterInstance(createAdapters(true));
    await adapterInstance.setStorageItem(PersistKey.AccessToken, 'value');
    await adapterInstance.setStorageItem(PersistKey.AccessToken, null);
    expect(await adapterInstance.storage.getItem(PersistKey.AccessToken)).toBeNull();
  });

  it('should be able get cached object', async () => {
    const adapterInstance = new ClientAdapterInstance(createAdapters(true));
    await adapterInstance.cache?.setItem(CacheKey.OpenidConfig, JSON.stringify({ test: 'test' }));
    expect(await adapterInstance.getCachedObject(CacheKey.OpenidConfig)).toEqual({ test: 'test' });
  });

  it('treats malformed cached JSON as a miss', async () => {
    const adapterInstance = new ClientAdapterInstance(createAdapters(true));
    await adapterInstance.cache?.setItem(CacheKey.OpenidConfig, 'not-json');
    const getter = vi.fn(async () => ({ test: 'recovered' }));

    await expect(adapterInstance.getWithCache(CacheKey.OpenidConfig, getter)).resolves.toEqual({
      test: 'recovered',
    });
    expect(getter).toHaveBeenCalledOnce();
  });

  it('supports the deprecated cache alias', () => {
    const unstableCache = new MockedStorage();
    const adapterInstance = new ClientAdapterInstance({
      ...createAdapters(),
      cache: undefined,
      unstable_cache: unstableCache,
    });

    expect(adapterInstance.cache).toBe(unstableCache);
    expect(adapterInstance.unstable_cache).toBe(unstableCache);
  });

  it('prefers the stable cache when both cache properties are provided', () => {
    const cache = new MockedStorage();
    const adapterInstance = new ClientAdapterInstance({
      ...createAdapters(),
      cache,
      unstable_cache: new MockedStorage(),
    });

    expect(adapterInstance.cache).toBe(cache);
    expect(adapterInstance.unstable_cache).toBe(cache);
  });

  it('should be able get with cache and directly return the cached value when needed', async () => {
    const adapterInstance = new ClientAdapterInstance(createAdapters(true));
    const spy = vi.spyOn(adapterInstance, 'getWithCache');
    const getter = vi.fn().mockResolvedValue({ test: 'test' });

    expect(await adapterInstance.getWithCache(CacheKey.OpenidConfig, getter)).toEqual({
      test: 'test',
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(getter).toHaveBeenCalledTimes(1);
    expect(await adapterInstance.cache?.getItem(CacheKey.OpenidConfig)).toBe(
      JSON.stringify({
        test: 'test',
      })
    );

    expect(await adapterInstance.getWithCache(CacheKey.OpenidConfig, getter)).toEqual({
      test: 'test',
    });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(getter).toHaveBeenCalledTimes(1);
  });

  it('should fall back to the current caller getter when the in-flight getter rejects', async () => {
    const adapters = createAdapters(true);
    const firstAdapterInstance = new ClientAdapterInstance(adapters);
    const secondAdapterInstance = new ClientAdapterInstance(adapters);
    const firstGetter = vi.fn(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
      throw new Error('transient failure');
    });
    const secondGetter = vi.fn().mockResolvedValue({ test: 'recovered' });

    const firstCall = firstAdapterInstance.getWithCache(CacheKey.OpenidConfig, firstGetter);
    const secondCall = secondAdapterInstance.getWithCache(CacheKey.OpenidConfig, secondGetter);

    await expect(firstCall).rejects.toThrow('transient failure');
    await expect(secondCall).resolves.toEqual({ test: 'recovered' });
    expect(secondGetter).toHaveBeenCalledTimes(1);
    expect(await adapters.cache?.getItem(CacheKey.OpenidConfig)).toBe(
      JSON.stringify({ test: 'recovered' })
    );

    const thirdGetter = vi.fn().mockResolvedValue({ test: 'should not run' });
    const thirdAdapterInstance = new ClientAdapterInstance(adapters);

    expect(await thirdAdapterInstance.getWithCache(CacheKey.OpenidConfig, thirdGetter)).toEqual({
      test: 'recovered',
    });
    expect(thirdGetter).not.toHaveBeenCalled();
  });

  it('should deduplicate concurrent cache misses for the same cache storage', async () => {
    const adapters = createAdapters(true);
    const firstAdapterInstance = new ClientAdapterInstance(adapters);
    const secondAdapterInstance = new ClientAdapterInstance(adapters);
    const getter = vi.fn(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      return { test: 'test' };
    });

    await expect(
      Promise.all([
        firstAdapterInstance.getWithCache(CacheKey.OpenidConfig, getter),
        secondAdapterInstance.getWithCache(CacheKey.OpenidConfig, getter),
      ])
    ).resolves.toEqual([{ test: 'test' }, { test: 'test' }]);
    expect(getter).toHaveBeenCalledTimes(1);
  });

  it('returns one shared result when cache storage rejects a write', async () => {
    const cache = new MockedStorage();
    vi.spyOn(cache, 'setItem').mockRejectedValue(new Error('Cache unavailable'));
    const adapters = { ...createAdapters(), cache };
    const firstAdapterInstance = new ClientAdapterInstance(adapters);
    const secondAdapterInstance = new ClientAdapterInstance(adapters);
    const getter = vi.fn(async () => ({ test: 'test' }));

    await expect(
      Promise.all([
        firstAdapterInstance.getWithCache(CacheKey.OpenidConfig, getter),
        secondAdapterInstance.getWithCache(CacheKey.OpenidConfig, getter),
      ])
    ).resolves.toEqual([{ test: 'test' }, { test: 'test' }]);
    expect(getter).toHaveBeenCalledTimes(1);
  });
});
