import { IncomingMessage } from 'http';

import { Storage, StorageKey } from '@logto/node';

export default class NextStorage implements Storage {
  private sessionChanged = false;
  constructor(private readonly request: IncomingMessage) {}

  async setItem(key: StorageKey, value: string) {
    this.request.session[key] = value;
    this.sessionChanged = true;
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
    this.sessionChanged = true;
  }

  async save() {
    if (!this.sessionChanged) {
      return;
    }

    await this.request.session.save();
    this.sessionChanged = false;
  }
}
