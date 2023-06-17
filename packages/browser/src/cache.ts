import type { Storage, CacheKey } from '@logto/client';
import type { Nullable } from '@silverhand/essentials';

const keyPrefix = `logto_cache`;

export class CacheStorage implements Storage<CacheKey> {
  constructor(public readonly appId: string) {}

  getKey(item?: string) {
    if (item === undefined) {
      return `${keyPrefix}:${this.appId}`;
    }

    return `${keyPrefix}:${this.appId}:${item}`;
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
