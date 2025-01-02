import { type PersistKey, type Storage } from '@logto/client';
import { type CookieSerializeOptions } from 'cookie';

import { PromiseQueue } from './promise-queue.js';
import { wrapSession, unwrapSession, type SessionData } from './session.js';

// eslint-disable-next-line @typescript-eslint/ban-types
type Nullable<T> = T | null;

export type CookieConfigBase = {
  cookieKey?: string;
  isSecure?: boolean;
  getCookie: (name: string) => Promise<string | undefined> | string | undefined;
  setCookie: (
    name: string,
    value: string,
    options: CookieSerializeOptions & { path: string }
  ) => Promise<void> | void;
};

export type SessionWrapper = {
  wrap: (data: SessionData, key: string) => Promise<string>;
  unwrap: (value: string, key: string) => Promise<SessionData>;
};

export type CookieConfig = CookieConfigBase &
  (
    | {
        /** Required when using default session wrapper */
        encryptionKey: string;
        sessionWrapper?: never;
      }
    | {
        /** Optional when custom sessionWrapper is provided */
        encryptionKey?: string;
        /** Custom session wrapper can be used to implement external storage solutions */
        sessionWrapper: SessionWrapper;
      }
  );

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

  /**
   * Handles the wrapping and unwrapping of session data.
   * Can be provided via config or defaults to using wrapSession/unwrapSession functions.
   * Users can implement custom storage solutions by providing their own sessionWrapper.
   */
  protected sessionWrapper: SessionWrapper;

  constructor(public config: CookieConfig) {
    if (!config.sessionWrapper && !config.encryptionKey) {
      throw new TypeError(
        'Either `sessionWrapper` or `encryptionKey` must be provided for `CookieStorage`'
      );
    }

    this.sessionWrapper = config.sessionWrapper ?? {
      wrap: wrapSession,
      unwrap: unwrapSession,
    };
  }

  async init() {
    const { encryptionKey = '' } = this.config;
    this.sessionData = await this.sessionWrapper.unwrap(
      (await this.config.getCookie(this.cookieKey)) ?? '',
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
    const { encryptionKey = '' } = this.config;
    const value = await this.sessionWrapper.wrap(data, encryptionKey);
    await this.config.setCookie(this.cookieKey, value, this.cookieOptions);
  }
}
