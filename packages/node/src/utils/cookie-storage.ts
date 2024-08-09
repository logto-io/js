import { type PersistKey, type Storage } from '@logto/client';
import { type CookieSerializeOptions } from 'cookie';

import { PromiseQueue } from './promise-queue.js';
import { wrapSession, unwrapSession, type SessionData } from './session.js';

// eslint-disable-next-line @typescript-eslint/ban-types
type Nullable<T> = T | null;

export type CookieConfig = {
  /** The encryption key to encrypt the session data. It should be a random string. */
  encryptionKey: string;
  /** The name of the cookie key. Default to `logtoCookies`. */
  cookieKey?: string;
  /** Set to true in https */
  isSecure?: boolean;
  getCookie: (name: string) => string | undefined;
  setCookie: (
    name: string,
    value: string,
    options: CookieSerializeOptions & { path: string }
  ) => void;
};

/**
 * A storage that persists data in cookies with encryption.
 */
export class CookieStorage implements Storage<PersistKey> {
  protected get cookieOptions() {
    return Object.freeze({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: this.config.isSecure ?? false,
      maxAge: 14 * 24 * 3600, // 14 days
    } satisfies Readonly<CookieSerializeOptions & { path: string }>);
  }

  protected get cookieKey() {
    return this.config.cookieKey ?? 'logtoCookies';
  }

  get data() {
    return this.sessionData;
  }

  protected sessionData: SessionData = {};
  protected saveQueue = new PromiseQueue();

  constructor(public config: CookieConfig) {
    if (!config.encryptionKey) {
      throw new TypeError('The `encryptionKey` string is required for `CookieStorage`');
    }
  }

  async init() {
    const { encryptionKey } = this.config;
    this.sessionData = await unwrapSession(
      this.config.getCookie(this.cookieKey) ?? '',
      encryptionKey
    );
  }

  async getItem(key: PersistKey): Promise<Nullable<string>> {
    return this.sessionData[key] ?? null;
  }

  async setItem(key: PersistKey, value: string): Promise<void> {
    this.sessionData[key] = value;
    await this.save();
  }

  async removeItem(key: PersistKey): Promise<void> {
    // eslint-disable-next-line @silverhand/fp/no-delete, @typescript-eslint/no-dynamic-delete
    delete this.sessionData[key];
    await this.save();
  }

  async destroy() {
    this.sessionData = {};
    await this.save();
  }

  protected async save() {
    return this.saveQueue.enqueue(async () => this.write());
  }

  protected async write(data = this.sessionData) {
    const { encryptionKey } = this.config;
    const value = await wrapSession(data, encryptionKey);
    this.config.setCookie(this.cookieKey, value, this.cookieOptions);
  }
}
