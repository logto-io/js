import type { CacheKey, Storage } from '@logto/client';

const cacheStorageMap = new Map<string, Storage<CacheKey>>();
const cacheData = new Map<string, string>();

const normalizeEndpoint = (endpoint: string) => endpoint.replace(/\/+$/, '');

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
