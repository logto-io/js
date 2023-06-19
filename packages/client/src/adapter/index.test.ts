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
    const spy = jest.spyOn(adapterInstance, 'getWithCache');
    const getter = jest.fn().mockResolvedValue({ test: 'test' });

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
});
