import { Storage, StorageKey } from '@logto/node';

import { NextRequestWithIronSession } from './types';

export default class NextStorage implements Storage {
  constructor(private readonly request: NextRequestWithIronSession) {}

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

  async save() {
    await this.request.session.save();
  }
}
