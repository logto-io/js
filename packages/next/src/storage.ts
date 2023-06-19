import type { Storage, StorageKey } from '@logto/node';
import { type IronSession } from 'iron-session';

export default class NextStorage implements Storage<StorageKey> {
  private sessionChanged = false;
  constructor(private readonly session: IronSession) {}

  async setItem(key: StorageKey, value: string) {
    this.session[key] = value;
    this.sessionChanged = true;
  }

  async getItem(key: StorageKey) {
    const value = this.session[key];

    if (value === undefined) {
      return null;
    }

    return String(value);
  }

  async removeItem(key: StorageKey) {
    this.session[key] = undefined;
    this.sessionChanged = true;
  }

  async save() {
    if (!this.sessionChanged) {
      return;
    }

    await this.session.save();
    this.sessionChanged = false;
  }
}
