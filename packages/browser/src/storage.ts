import { Storage, StorageKey } from '@logto/client';
import { Nullable } from '@silverhand/essentials';

export const logtoStorageItemKeyPrefix = `logto`;

export class BrowserStorage implements Storage {
  private readonly storageKey: string;

  constructor(appId: string) {
    this.storageKey = `${logtoStorageItemKeyPrefix}:${appId}`;
  }

  getItem(key: StorageKey): Nullable<string> {
    if (key === 'signInSession') {
      return sessionStorage.getItem(this.storageKey);
    }

    return localStorage.getItem(`${this.storageKey}:${key}`);
  }

  setItem(key: StorageKey, value: string): void {
    if (key === 'signInSession') {
      sessionStorage.setItem(this.storageKey, value);

      return;
    }
    localStorage.setItem(`${this.storageKey}:${key}`, value);
  }

  removeItem(key: StorageKey): void {
    if (key === 'signInSession') {
      sessionStorage.removeItem(this.storageKey);

      return;
    }
    localStorage.removeItem(`${this.storageKey}:${key}`);
  }
}
