import type { CacheKey, ClientAdapter, Storage } from '@logto/client';

const cacheStorageMap = new Map<string, Storage<CacheKey>>();
const cacheData = new Map<string, string>();

const normalizeEndpoint = (endpoint: string) => endpoint.replace(/\/+$/, '');

/**
 * Creates an endpoint-scoped cache that is shared for the lifetime of the current process.
 */
export const createMemoryCache = (endpoint: string): Storage<CacheKey> => {
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  const cacheStorage = cacheStorageMap.get(normalizedEndpoint);

  if (cacheStorage) {
    return cacheStorage;
  }

  const getCacheKey = (key: CacheKey) => `${normalizedEndpoint}:${key}`;
  const newCacheStorage: Storage<CacheKey> = {
    getItem: async (key) => cacheData.get(getCacheKey(key)) ?? null,
    setItem: async (key, value) => {
      cacheData.set(getCacheKey(key), value);
    },
    removeItem: async (key) => {
      cacheData.delete(getCacheKey(key));
    },
  };

  cacheStorageMap.set(normalizedEndpoint, newCacheStorage);
  return newCacheStorage;
};

type CacheAdapter = Pick<ClientAdapter, 'cache' | 'unstable_cache'>;

export const resolveAdapterCache = (adapter: CacheAdapter, endpoint: string): Storage<CacheKey> =>
  adapter.cache ?? adapter.unstable_cache ?? createMemoryCache(endpoint);
