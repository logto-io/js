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

/**
 * The storage object that allows the client to persist data.
 *
 * It's compatible with the `localStorage` API.
 */
export type Storage<Keys extends string> = {
  getItem(key: Keys): Promise<Nullable<string>>;
  setItem(key: Keys, value: string): Promise<void>;
  removeItem(key: Keys): Promise<void>;
};

export type InferStorageKey<S> = S extends Storage<infer Key> ? Key : never;

/**
 * The navigation function that redirects the user to the specified URL.
 *
 * @param url The URL to navigate to.
 * @param parameters The parameters for the navigation.
 * @param parameters.redirectUri The redirect URI that the user will be redirected to after the
 * flow is completed. That is, the "redirect URI" for sign-in and "post-logout redirect URI" for
 * sign-out.
 * @param parameters.for The purpose of the navigation. It can be either "sign-in" or "sign-out".
 * @remarks Usually, the `redirectUri` parameter can be ignored unless the client needs to pass the
 * redirect scheme or other parameters to the native app, such as `ASWebAuthenticationSession` in
 * iOS.
 */
export type Navigate = (
  url: string,
  parameters: { redirectUri?: string; for: 'sign-in' | 'sign-out' }
) => void | Promise<void>;

export type JwtVerifier = {
  verifyIdToken(idToken: string): Promise<void>;
};

/**
 * The adapter object that allows the customizations of the client behavior
 * for different environments.
 */
export type ClientAdapter = {
  /**
   * The fetch-like function for network requests.
   *
   * @see {@link Requester}
   */
  requester: Requester;
  /**
   * The storage for storing tokens and sessions. It is usually persistent.
   *
   * @see {@link Requester}
   */
  storage: Storage<StorageKey | PersistKey>;
  /**
   * An optional storage for caching well-known data.
   *
   * @see {@link CacheKey}
   */
  unstable_cache?: Storage<CacheKey>;
  navigate: Navigate;
  /**
   * The function that generates a random state string.
   *
   * @returns The state string.
   */
  generateState: () => string | Promise<string>;
  /**
   * The function that generates a random code verifier string for PKCE.
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7636.html | RFC 7636}
   * @returns The code verifier string.
   */
  generateCodeVerifier: () => string | Promise<string>;
  /**
   * The function that generates a code challenge string based on the code verifier
   * for PKCE.
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7636.html | RFC 7636}
   * @param codeVerifier The code verifier string.
   * @returns The code challenge string.
   */
  generateCodeChallenge: (codeVerifier: string) => string | Promise<string>;
};
