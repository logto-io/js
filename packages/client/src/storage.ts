import { nowRoundToSec } from './utils';

const STORAGE_KEY_PREFIX = 'logto:';

const getKey = (key: string) => `${STORAGE_KEY_PREFIX}${key}`;

const safeParse = <T>(value: string): T | undefined => {
  try {
    return JSON.parse(value) as T;
  } catch {
    // Noop
  }
};

interface ClientStorageOptions {
  secondsUntilExpire: number;
}

export interface ClientStorage {
  getItem<T>(key: string): T | undefined;
  setItem(key: string, value: unknown, options?: ClientStorageOptions): void;
  removeItem(key: string): void;
}

export class LocalStorage implements ClientStorage {
  storage: Storage = localStorage;

  getItem<T>(key: string) {
    const value = this.storage.getItem(getKey(key));
    if (!value) {
      return;
    }

    const payload = safeParse<{ expiresAt?: number; value: T }>(value);
    if (!payload) {
      // When JSON parse failed, return undefined.
      return;
    }

    if (payload.expiresAt && payload.expiresAt <= nowRoundToSec()) {
      this.removeItem(key);
      return;
    }

    return payload.value;
  }

  setItem(key: string, value: unknown, options?: ClientStorageOptions) {
    this.storage.setItem(
      getKey(key),
      JSON.stringify({
        expiresAt:
          typeof options?.secondsUntilExpire === 'number'
            ? nowRoundToSec() + options.secondsUntilExpire
            : undefined,
        value,
      })
    );
  }

  removeItem(key: string) {
    this.storage.removeItem(getKey(key));
  }
}

export class SessionStorage extends LocalStorage {
  storage: Storage = sessionStorage;
}
