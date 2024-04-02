import { type PersistKey, type Storage } from '@logto/browser';

const keyPrefix = `logto`;

export class ChromeExtensionStorage implements Storage<PersistKey> {
  constructor(public readonly appId: string) {}

  getKey(item?: string) {
    if (item === undefined) {
      return `${keyPrefix}:${this.appId}`;
    }

    return `${keyPrefix}:${this.appId}:${item}`;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  async getItem(key: PersistKey): Promise<string | null> {
    const storageKey = this.getKey(key);
    const object = await chrome.storage.local.get(storageKey);
    return object[storageKey] ? String(object[storageKey]) : null;
  }

  async setItem(key: PersistKey, value: string): Promise<void> {
    await chrome.storage.local.set({ [this.getKey(key)]: value });
  }

  async removeItem(key: PersistKey): Promise<void> {
    await chrome.storage.local.remove(this.getKey(key));
  }
}
