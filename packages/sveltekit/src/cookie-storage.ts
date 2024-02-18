import type { PersistKey, SessionData, Storage } from '@logto/node';
import { wrapSession, unwrapSession } from '@logto/node';
import type { Cookies, RequestEvent } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';

// eslint-disable-next-line @typescript-eslint/ban-types
type Nullable<T> = T | null;

export type CookieConfig = {
  requestEvent: RequestEvent;
  encryptionKey: string;
  cookieKey?: string;
};

export class CookieStorage implements Storage<PersistKey> {
  protected get cookieOptions() {
    return Object.freeze({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: this.#isSecure,
      maxAge: 14 * 24 * 3600, // 14 days
    } satisfies Readonly<CookieSerializeOptions & { path: string }>);
  }

  protected get cookieKey() {
    return this.config.cookieKey ?? 'logtoCookies';
  }

  get data() {
    return this.#sessionData;
  }

  #sessionData: SessionData = {};
  #isSecure: boolean;
  #cookies: Cookies;

  constructor(public config: CookieConfig) {
    const { request, cookies } = config.requestEvent;
    this.#isSecure =
      request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https');
    this.#cookies = cookies;
  }

  async init() {
    const { encryptionKey } = this.config;
    this.#sessionData = await unwrapSession(this.#cookies.get(this.cookieKey) ?? '', encryptionKey);
  }

  async getItem(key: PersistKey): Promise<Nullable<string>> {
    return this.#sessionData[key] ?? null;
  }

  async setItem(key: PersistKey, value: string): Promise<void> {
    this.#sessionData[key] = value;
    await this.save();
  }

  async removeItem(key: PersistKey): Promise<void> {
    // eslint-disable-next-line @silverhand/fp/no-delete, @typescript-eslint/no-dynamic-delete
    delete this.#sessionData[key];
    await this.save();
  }

  protected async save() {
    const { encryptionKey } = this.config;
    this.#cookies.set(
      this.cookieKey,
      await wrapSession(this.#sessionData, encryptionKey),
      this.cookieOptions
    );
  }
}
