import { Optional } from '@silverhand/essentials';

import { TOKEN_SET_CACHE_KEY } from './constants';
import discover, { OIDCConfiguration } from './discover';
import {
  grantTokenByAuthorizationCode,
  grantTokenByRefreshToken,
  TokenSetParameters,
} from './grant-token';
import { parseRedirectCallback } from './parse-callback';
import { getLoginUrlAndCodeVerifier } from './request-login';
import { getLogoutUrl } from './request-logout';
import SessionManager from './session-manager';
import { ClientStorage, LocalStorage } from './storage';
import TokenSet from './token-set';
import { generateScope } from './utils';
import { createJWKS, verifyIdToken } from './verify-id-token';

export * from './storage';

export interface ConfigParameters {
  domain: string;
  clientId: string;
  scope?: string | string[];
  storage?: ClientStorage;
  onAuthStateChange?: () => void;
}

export const appendSlashIfNeeded = (url: string): string => {
  if (url.endsWith('/')) {
    return url;
  }

  return url + '/';
};

export default class LogtoClient {
  private readonly oidcConfiguration: OIDCConfiguration;
  private readonly clientId: string;
  private readonly scope: string;
  private readonly sessionManager: SessionManager;
  private readonly storage: ClientStorage;
  private readonly onAuthStateChange: Optional<() => void>;
  private tokenSet: Optional<TokenSet>;
  constructor(config: ConfigParameters, oidcConfiguration: OIDCConfiguration) {
    const { clientId, scope, storage, onAuthStateChange } = config;
    this.clientId = clientId;
    this.onAuthStateChange = onAuthStateChange;
    this.scope = generateScope(scope);
    this.oidcConfiguration = oidcConfiguration;
    this.storage = storage ?? new LocalStorage();
    this.sessionManager = new SessionManager(this.storage);
    this.createTokenSetFromCache();
  }

  static async create(config: ConfigParameters): Promise<LogtoClient> {
    return new LogtoClient(config, await discover(`https://${config.domain}`));
  }

  public async loginWithRedirect(redirectUri: string) {
    const { url, codeVerifier } = await getLoginUrlAndCodeVerifier({
      baseUrl: this.oidcConfiguration.authorization_endpoint,
      clientId: this.clientId,
      scope: this.scope,
      redirectUri,
    });
    this.sessionManager.set({ redirectUri, codeVerifier });
    window.location.assign(url);
  }

  public isLoginRedirect(url: string) {
    try {
      const { code, error } = parseRedirectCallback(url);

      if (error || !code) {
        return false;
      }
    } catch {
      return false;
    }

    const session = this.sessionManager.get();

    if (!session) {
      return false;
    }

    const { redirectUri } = session;
    return url.startsWith(redirectUri);
  }

  public async handleCallback(url: string) {
    const { code, error, error_description } = parseRedirectCallback(url);

    if (error) {
      throw new Error(error_description ?? error);
    }

    if (!code) {
      throw new Error(`Can not found authorization_code in url: ${url}`);
    }

    const session = this.sessionManager.get();

    if (!session) {
      throw new Error('Session not found');
    }

    const { redirectUri, codeVerifier } = session;
    this.sessionManager.clear();
    const tokenParameters = await grantTokenByAuthorizationCode({
      endpoint: this.oidcConfiguration.token_endpoint,
      clientId: this.clientId,
      code,
      redirectUri,
      codeVerifier,
    });
    await verifyIdToken(
      createJWKS(this.oidcConfiguration.jwks_uri),
      tokenParameters.id_token,
      this.clientId
    );
    this.storage.setItem(this.tokenSetCacheKey, tokenParameters);
    this.tokenSet = new TokenSet(tokenParameters);
    if (this.onAuthStateChange) {
      this.onAuthStateChange();
    }
  }

  public getClaims() {
    if (!this.isAuthenticated || !this.tokenSet) {
      throw new Error('Not authenticated');
    }

    return this.tokenSet.claims();
  }

  public isAuthenticated() {
    return Boolean(this.tokenSet);
  }

  public async getAccessToken() {
    if (!this.isAuthenticated || !this.tokenSet) {
      throw new Error('Not authenticated');
    }

    if (!this.tokenSet.expired()) {
      return this.tokenSet.accessToken;
    }

    const tokenParameters = await grantTokenByRefreshToken(
      this.oidcConfiguration.token_endpoint,
      this.clientId,
      this.tokenSet.refreshToken
    );
    await verifyIdToken(
      createJWKS(this.oidcConfiguration.jwks_uri),
      tokenParameters.id_token,
      this.clientId
    );
    this.storage.setItem(this.tokenSetCacheKey, tokenParameters);
    this.tokenSet = new TokenSet(tokenParameters);
    return this.tokenSet.accessToken;
  }

  public logout(redirectUri: string) {
    this.sessionManager.clear();
    if (this.onAuthStateChange) {
      this.onAuthStateChange();
    }

    if (!this.tokenSet) {
      return;
    }

    const url = getLogoutUrl(
      this.oidcConfiguration.end_session_endpoint,
      this.tokenSet.idToken,
      redirectUri
    );
    this.tokenSet = undefined;
    this.storage.removeItem(this.tokenSetCacheKey);
    window.location.assign(url);
  }

  private get tokenSetCacheKey() {
    return `${TOKEN_SET_CACHE_KEY}::${this.oidcConfiguration.issuer}::${this.clientId}::${this.scope}`;
  }

  private createTokenSetFromCache() {
    const parameters = this.storage.getItem<TokenSetParameters>(this.tokenSetCacheKey);
    if (parameters) {
      this.tokenSet = new TokenSet(parameters);
      if (this.onAuthStateChange) {
        this.onAuthStateChange();
      }
    }
  }
}
