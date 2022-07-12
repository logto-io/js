import { Nullable } from '@silverhand/essentials';

type StorageKey = 'idToken' | 'refreshToken' | 'accessToken' | 'signInSession';

export interface Storage {
  getItem(key: StorageKey): Nullable<string>;
  setItem(key: StorageKey, value: string): void;
  removeItem(key: StorageKey): void;
}
