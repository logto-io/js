import { IncomingMessage } from 'http';

import { Storage, StorageKey } from '@logto/node';

export default class ExpressStorage implements Storage {
  constructor(private readonly request: IncomingMessage) {}

  async setItem(key: StorageKey, value: string) {
    this.request.session[key] = value;
  }

  getItem(key: StorageKey) {
    const value = this.request.session[key];

    if (value === undefined) {
      return null;
    }

    return String(value);
  }

  removeItem(key: StorageKey) {
    this.request.session[key] = undefined;
  }
}
