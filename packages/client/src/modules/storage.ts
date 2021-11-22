import { Optional } from '@silverhand/essentials';

import { STORAGE_KEY_PREFIX } from '../constants';

const getKey = (key: string) => `${STORAGE_KEY_PREFIX}:${key}`;

const safeParse = <T>(value: string): T | undefined => {
  try {
    return JSON.parse(value) as T;
  } catch {
    // Noop
  }
};

interface ClientStorageOptions {
  millisecondsUntilExpire: number;
}

export interface ClientStorage {
  getItem<T>(key: string): T | undefined;
  setItem(key: string, value: unknown, options?: ClientStorageOptions): void;
  removeItem(key: string): void;
}

type StoragePayload<T> = {
  expiresAt: Optional<number>;
  value: T;
};

export class LocalStorage implements ClientStorage {
  storage: Storage = localStorage;

  getItem<T>(key: string) {
    const value = this.storage.getItem(getKey(key));
    if (!value) {
      return;
    }

    const payload = safeParse<StoragePayload<T>>(value);
    if (!payload) {
      // When JSON parse failed, return undefined.
      return;
    }

    if (payload.expiresAt && payload.expiresAt <= Date.now()) {
      this.removeItem(key);
      return;
    }

    return payload.value;
  }

  setItem(key: string, value: unknown, options?: ClientStorageOptions) {
    const payload: StoragePayload<unknown> = {
      expiresAt:
        typeof options?.millisecondsUntilExpire === 'number'
          ? Date.now() + options.millisecondsUntilExpire
          : undefined,
      value,
    };
    this.storage.setItem(getKey(key), JSON.stringify(payload));
  }

  removeItem(key: string) {
    this.storage.removeItem(getKey(key));
  }
}

export class SessionStorage extends LocalStorage {
  storage: Storage = sessionStorage;
}

export class MemoryStorage implements ClientStorage {
  storage: Map<string, StoragePayload<unknown>> = new Map();

  getItem<T>(key: string) {
    const payload = this.storage.get(key);

    if (!payload) {
      return;
    }

    if (payload.expiresAt && payload.expiresAt <= Date.now()) {
      this.removeItem(key);
      return;
    }

    return payload.value as T;
  }

  setItem(key: string, value: unknown, options?: ClientStorageOptions) {
    const payload: StoragePayload<unknown> = {
      expiresAt:
        typeof options?.millisecondsUntilExpire === 'number'
          ? Date.now() + options.millisecondsUntilExpire
          : undefined,
      value,
    };
    this.storage.set(key, payload);
  }

  removeItem(key: string) {
    this.storage.delete(key);
  }
}
