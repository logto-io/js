import type { Storage, StorageKey } from '@logto/client';
import type { Nullable } from '@silverhand/essentials';

export const logtoStorageItemKeyPrefix = `logto`;

export class BrowserStorage implements Storage {
  private readonly storageKey: string;

  constructor(appId: string) {
    this.storageKey = `${logtoStorageItemKeyPrefix}:${appId}`;
  }

  async getItem(key: StorageKey): Promise<Nullable<string>> {
    if (key === 'signInSession') {
      return sessionStorage.getItem(this.storageKey);
    }

    return localStorage.getItem(`${this.storageKey}:${key}`);
  }

  async setItem(key: StorageKey, value: string): Promise<void> {
    if (key === 'signInSession') {
      sessionStorage.setItem(this.storageKey, value);

      return;
    }
    localStorage.setItem(`${this.storageKey}:${key}`, value);
  }

  async removeItem(key: StorageKey): Promise<void> {
    if (key === 'signInSession') {
      sessionStorage.removeItem(this.storageKey);

      return;
    }
    localStorage.removeItem(`${this.storageKey}:${key}`);
  }
}
