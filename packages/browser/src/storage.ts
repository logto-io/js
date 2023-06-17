import type { Storage, StorageKey } from '@logto/client';
import type { Nullable } from '@silverhand/essentials';

const keyPrefix = `logto`;

export class BrowserStorage implements Storage<StorageKey> {
  constructor(public readonly appId: string) {}

  getKey(item?: string) {
    if (item === undefined) {
      return `${keyPrefix}:${this.appId}`;
    }

    return `${keyPrefix}:${this.appId}:${item}`;
  }

  async getItem(key: StorageKey): Promise<Nullable<string>> {
    if (key === 'signInSession') {
      // The latter `getItem()` is for backward compatibility. Can be removed when major bump.
      return sessionStorage.getItem(this.getKey(key)) ?? sessionStorage.getItem(this.getKey());
    }

    return localStorage.getItem(this.getKey(key));
  }

  async setItem(key: StorageKey, value: string): Promise<void> {
    if (key === 'signInSession') {
      sessionStorage.setItem(this.getKey(key), value);
      return;
    }
    localStorage.setItem(this.getKey(key), value);
  }

  async removeItem(key: StorageKey): Promise<void> {
    if (key === 'signInSession') {
      sessionStorage.removeItem(this.getKey(key));
      return;
    }
    localStorage.removeItem(this.getKey(key));
  }
}
