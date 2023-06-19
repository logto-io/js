import type { Requester } from '@logto/js';
import type { Nullable } from '@silverhand/essentials';

/** @deprecated Use {@link PersistKey} instead. */
export type StorageKey = 'idToken' | 'refreshToken' | 'accessToken' | 'signInSession';

export enum PersistKey {
  IdToken = 'idToken',
  RefreshToken = 'refreshToken',
  AccessToken = 'accessToken',
  SignInSession = 'signInSession',
}

export enum CacheKey {
  /**
   * OpenID Configuration endpoint response.
   *
   * @see {@link https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfigurationResponse | OpenID Connect Discovery 1.0}
   */
  OpenidConfig = 'openidConfiguration',
  /**
   * The content of OpenID Provider's `jwks_uri` (JSON Web Key Set).
   *
   * @see {@link https://openid.net/specs/openid-connect-discovery-1_0-21.html#ProviderMetadata | OpenID Connect Discovery 1.0}
   */
  Jwks = 'jwks',
}

export type Storage<Keys extends string> = {
  getItem(key: Keys): Promise<Nullable<string>>;
  setItem(key: Keys, value: string): Promise<void>;
  removeItem(key: Keys): Promise<void>;
};

export type InferStorageKey<S> = S extends Storage<infer Key> ? Key : never;

export type Navigate = (url: string) => void;

export type ClientAdapter = {
  requester: Requester;
  storage: Storage<StorageKey | PersistKey>;
  /**
   * An optional storage for caching well-known data.
   *
   * @see {@link CacheKey}
   */
  unstable_cache?: Storage<CacheKey>;
  navigate: Navigate;
  generateState: () => string;
  generateCodeVerifier: () => string;
  generateCodeChallenge: (codeVerifier: string) => Promise<string>;
};
