import { Requester } from '@logto/js';
import { Nullable } from '@silverhand/essentials';

export type StorageKey = 'idToken' | 'refreshToken' | 'accessToken' | 'signInSession';

export interface Storage {
  getItem(key: StorageKey): Nullable<string>;
  setItem(key: StorageKey, value: string): void;
  removeItem(key: StorageKey): void;
}

export type Navigate = (url: string) => void;

export type ClientAdapter = {
  requester: Requester;
  storage: Storage;
  navigate: Navigate;
  generateState: () => string;
  generateCodeVerifier: () => string;
  generateCodeChallenge: (codeVerifier: string) => Promise<string>;
};
