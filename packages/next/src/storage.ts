import { type Session, type Storage } from '@logto/node';
import { PersistKey } from '@logto/node/edge';

export default class NextStorage implements Storage<PersistKey> {
  private sessionChanged = false;
  constructor(private readonly session: Session & { save: () => Promise<void> }) {}

  async setItem(key: PersistKey, value: string) {
    this.session[key] = value;
    this.sessionChanged = true;
  }

  async getItem(key: PersistKey) {
    const value = this.session[key];

    if (value === undefined) {
      return null;
    }

    return String(value);
  }

  async removeItem(key: PersistKey) {
    this.session[key] = undefined;
    this.sessionChanged = true;
  }

  async destroy() {
    this.session[PersistKey.AccessToken] = undefined;
    this.session[PersistKey.IdToken] = undefined;
    this.session[PersistKey.SignInSession] = undefined;
    this.session[PersistKey.RefreshToken] = undefined;
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
