import { type Requester } from '@logto/js';
import { trySafe, type Nullable, conditional } from '@silverhand/essentials';

import { createRequester, type CreateRequesterOptions } from '../utils/requester.js';

import {
  type CacheKey,
  type Navigate,
  type PersistKey,
  type Storage,
  type StorageKey,
  type ClientAdapter,
  type InferStorageKey,
} from './types.js';

// Track in-flight cache writes per cache storage instance. A WeakMap keeps this helper from
// extending the lifetime of adapter-provided cache stores.
const runningCacheGetters = new WeakMap<Storage<CacheKey>, Map<CacheKey, Promise<unknown>>>();

const getRunningCacheGetterMap = (cache: Storage<CacheKey>) => {
  const runningGetterMap = runningCacheGetters.get(cache);

  if (runningGetterMap) {
    return runningGetterMap;
  }

  const newRunningGetterMap = new Map<CacheKey, Promise<unknown>>();
  runningCacheGetters.set(cache, newRunningGetterMap);
  return newRunningGetterMap;
};

export class ClientAdapterInstance {
  /*
   * Its properties are assigned by `Object.assign()` in the constructor.
   */
  requester!: Requester;
  storage!: Storage<StorageKey | PersistKey>;
  cache?: Storage<CacheKey> | undefined;
  /** @deprecated Use {@link cache} instead. */
  unstable_cache?: Storage<CacheKey> | undefined;
  navigate!: Navigate;
  generateState!: () => string | Promise<string>;
  generateCodeVerifier!: () => string | Promise<string>;
  generateCodeChallenge!: (codeVerifier: string) => string | Promise<string>;
  /* END OF IMPLEMENTATION */

  constructor(adapter: ClientAdapter, requestOptions: CreateRequesterOptions = {}) {
    const cache = adapter.cache ?? adapter.unstable_cache;
    const requester = adapter.fetch
      ? createRequester(adapter.fetch, requestOptions)
      : adapter.requester ?? createRequester(globalThis.fetch, requestOptions);

    // eslint-disable-next-line @silverhand/fp/no-mutating-assign
    Object.assign(this, adapter, {
      cache,
      unstable_cache: cache,
      requester,
    });
  }

  async setStorageItem(key: InferStorageKey<typeof this.storage>, value: Nullable<string>) {
    if (!value) {
      await this.storage.removeItem(key);
      return;
    }

    await this.storage.setItem(key, value);
  }

  /**
   * Try to get the string value from the cache and parse as JSON.
   * Return the parsed value if it is an object, return `undefined` otherwise.
   *
   * @param key The cache key to get value from.
   */
  async getCachedObject<T>(key: CacheKey): Promise<T | undefined> {
    const cached = await trySafe(async () => {
      const data = await this.cache?.getItem(key);
      // It's actually `unknown`
      // eslint-disable-next-line no-restricted-syntax
      return conditional(data && (JSON.parse(data) as unknown));
    });

    if (cached && typeof cached === 'object') {
      // Trust cache for now
      // eslint-disable-next-line no-restricted-syntax
      return cached as T;
    }
  }

  /**
   * Try to get the value from the cache first, if it doesn't exist in cache,
   * run the getter function and store the result into cache.
   *
   * @param key The cache key to get value from.
   */
  async getWithCache<T>(key: CacheKey, getter: () => Promise<T>): Promise<T> {
    const cached = await this.getCachedObject<T>(key);

    if (cached) {
      return cached;
    }

    const { cache } = this;

    if (!cache) {
      return getter();
    }

    const runningGetterMap = getRunningCacheGetterMap(cache);
    const runningGetter = runningGetterMap.get(key);

    if (runningGetter) {
      // Another client sharing the same cache storage is already populating this key. Wait for it
      // instead of issuing a duplicate discovery request.
      try {
        // Cache keys identify one value shape, so all callers waiting on this key expect the same
        // result type.
        // eslint-disable-next-line no-restricted-syntax
        return (await runningGetter) as T;
      } catch {
        // The in-flight getter rejected before producing a value. Retry through the normal path.
      }
      return this.getWithCache(key, getter);
    }

    const newRunningGetter = (async () => {
      const result = await getter();
      // Cache storage is an optimization. A storage failure must not discard a successful result.
      await trySafe(async () => cache.setItem(key, JSON.stringify(result)));
      return result;
    })();
    const trackedRunningGetter = (async () => {
      try {
        return await newRunningGetter;
      } finally {
        runningGetterMap.delete(key);
      }
    })();
    runningGetterMap.set(key, trackedRunningGetter);

    return trackedRunningGetter;
  }
}

export * from './types.js';
