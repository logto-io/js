import type { Storage, CacheKey } from '@logto/client';
import type { Nullable } from '@silverhand/essentials';

const keyPrefix = `logto_cache`;
const normalizeEndpoint = (endpoint: string) => endpoint.replace(/\/+$/, '');

export class CacheStorage implements Storage<CacheKey> {
  constructor(
    public readonly endpoint: string,
    public readonly appId: string
  ) {}

  getKey(item?: string) {
    const namespace = `${keyPrefix}:${encodeURIComponent(normalizeEndpoint(this.endpoint))}:${
      this.appId
    }`;

    if (item === undefined) {
      return namespace;
    }

    return `${namespace}:${item}`;
  }

  async getItem(key: CacheKey): Promise<Nullable<string>> {
    return sessionStorage.getItem(this.getKey(key));
  }

  async setItem(key: CacheKey, value: string): Promise<void> {
    sessionStorage.setItem(this.getKey(key), value);
  }

  async removeItem(key: CacheKey): Promise<void> {
    sessionStorage.removeItem(`${this.getKey(key)}`);
  }
}
