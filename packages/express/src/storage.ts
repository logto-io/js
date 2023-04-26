import type { IncomingMessage } from 'node:http';

import type { Storage, StorageKey } from '@logto/node';

export default class ExpressStorage implements Storage {
  constructor(private readonly request: IncomingMessage) {}

  async setItem(key: StorageKey, value: string) {
    this.request.session[key] = value;
  }

  async getItem(key: StorageKey) {
    const value = this.request.session[key];

    if (value === undefined) {
      return null;
    }

    return String(value);
  }

  async removeItem(key: StorageKey) {
    this.request.session[key] = undefined;
  }
}
