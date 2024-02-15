import { type Requester } from '@logto/js';
import { trySafe, type Nullable, conditional } from '@silverhand/essentials';

import {
  type CacheKey,
  type Navigate,
  type PersistKey,
  type Storage,
  type StorageKey,
  type ClientAdapter,
  type InferStorageKey,
} from './types.js';

export class ClientAdapterInstance implements ClientAdapter {
  /*
   * Implement `ClientAdapter`. Its properties are assigned by
   * `Object.assign()` in the constructor.
   */
  requester!: Requester;
  storage!: Storage<StorageKey | PersistKey>;
  unstable_cache?: Storage<CacheKey> | undefined;
  navigate!: Navigate;
  generateState!: () => string | Promise<string>;
  generateCodeVerifier!: () => string | Promise<string>;
  generateCodeChallenge!: (codeVerifier: string) => string | Promise<string>;
  /* END OF IMPLEMENTATION */

  constructor(adapter: ClientAdapter) {
    // eslint-disable-next-line @silverhand/fp/no-mutating-assign
    Object.assign(this, adapter);
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
      const data = await this.unstable_cache?.getItem(key);
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

    const result = await getter();
    await this.unstable_cache?.setItem(key, JSON.stringify(result));
    return result;
  }
}

export * from './types.js';
