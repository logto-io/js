import { createAdapters } from '../mock.js';

import { CacheKey, ClientAdapterInstance, PersistKey } from './index.js';

describe('ClientAdapterInstance', () => {
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
    await adapterInstance.unstable_cache?.setItem(
      CacheKey.OpenidConfig,
      JSON.stringify({ test: 'test' })
    );
    expect(await adapterInstance.getCachedObject(CacheKey.OpenidConfig)).toEqual({ test: 'test' });
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
    expect(await adapterInstance.unstable_cache?.getItem(CacheKey.OpenidConfig)).toBe(
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
    expect(await adapters.unstable_cache?.getItem(CacheKey.OpenidConfig)).toBe(
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
});
