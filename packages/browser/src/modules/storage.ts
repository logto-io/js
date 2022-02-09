import { Optional } from '@silverhand/essentials';

const logtoStorageItemKeyPrefix = `logto:`;

const getLogtoKey = (key: string) => `${logtoStorageItemKeyPrefix}${key}`;

const getOriginalKeyByLogtoKey = (logtoKey: string | null) => {
  if (logtoKey?.startsWith(logtoStorageItemKeyPrefix)) {
    return logtoKey.slice(logtoStorageItemKeyPrefix.length);
  }
};

const safeJsonParse = <T>(value: string): T | undefined => {
  try {
    return JSON.parse(value) as T;
  } catch {
    // Noop
  }
};

type LogtoStorageItem<T> = {
  expiresAt?: number;
  value: T;
};

type LogtoStorageItemOptions = {
  expiresIn?: number;
};

interface AbstractLogtoStorage {
  readonly length: number;
  getItem<T>(key: string): Optional<T>;
  setItem<T>(key: string, value: T, options?: LogtoStorageItemOptions): void;
  removeItem(key: string): void;
  key(index: number): Optional<string>;
  clear(): void;
}

class LogtoStorage implements AbstractLogtoStorage {
  protected storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  public get length() {
    return this.storage.length;
  }

  public getItem<T>(key: string) {
    const logtoKey = getLogtoKey(key);

    const item = this.storage.getItem(logtoKey);

    if (!item) {
      return;
    }

    const logtoStorageItem = safeJsonParse<LogtoStorageItem<T>>(item);

    if (!logtoStorageItem) {
      // If fail to parse JSON value, will return null.
      return;
    }

    const { value, expiresAt } = logtoStorageItem;

    if (expiresAt && expiresAt <= Date.now()) {
      this.removeItem(logtoKey);

      return;
    }

    return value;
  }

  public setItem<T>(key: string, value: T, options?: LogtoStorageItemOptions) {
    const logtoStorageItem: LogtoStorageItem<T> = {
      expiresAt:
        typeof options?.expiresIn === 'number' ? Date.now() + options.expiresIn : undefined,
      value,
    };

    this.storage.setItem(getLogtoKey(key), JSON.stringify(logtoStorageItem));
  }

  public removeItem(key: string) {
    this.storage.removeItem(getLogtoKey(key));
  }

  public key(index: number) {
    return getOriginalKeyByLogtoKey(this.storage.key(index));
  }

  public clear() {
    this.storage.clear();
  }
}

class MapStorage implements Storage {
  protected map = new Map<string, string>();

  public get length() {
    return this.map.size;
  }

  public clear() {
    this.map.clear();
  }

  public getItem(key: string) {
    return this.map.get(key) ?? null;
  }

  public key(index: number) {
    if (index >= this.map.size) {
      return null;
    }

    // eslint-disable-next-line @silverhand/fp/no-let
    let i = 0;

    for (const key of Array.from(this.map.keys())) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      if (i++ === index) {
        return key;
      }
    }

    return null;
  }

  public removeItem(key: string) {
    this.map.delete(key);
  }

  public setItem(key: string, value: string) {
    this.map.set(key, value);
  }
}

export class LogtoSessionStorage extends LogtoStorage {
  constructor() {
    super(sessionStorage);
  }
}

export class LogtoLocalStorage extends LogtoStorage {
  constructor() {
    super(localStorage);
  }
}

export class LogtoMemoryStorage extends LogtoStorage {
  constructor() {
    super(new MapStorage());
  }
}
