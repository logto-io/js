import type { Requester } from '@logto/js';
import type { Nullable } from '@silverhand/essentials';

export type StorageKey = 'idToken' | 'refreshToken' | 'accessToken' | 'signInSession';

export type Storage = {
  getItem(key: StorageKey): Promise<Nullable<string>>;
  setItem(key: StorageKey, value: string): Promise<void>;
  removeItem(key: StorageKey): Promise<void>;
};

export type Navigate = (url: string) => void;

export type ClientAdapter = {
  requester: Requester;
  storage: Storage;
  navigate: Navigate;
  generateState: () => string;
  generateCodeVerifier: () => string;
  generateCodeChallenge: (codeVerifier: string) => Promise<string>;
};
