import { Optional } from '@silverhand/essentials';

import discover, { OIDCConfiguration } from './discover';
import { grantTokenByAuthorizationCode, TokenSetParameters } from './grant-token';
import { getLoginUrlAndCodeVerifier } from './request-login';
import { getLogoutUrl } from './request-logout';
import SessionManager from './session-manager';
import { ClientStorage, LocalStorage } from './storage';
import TokenSet from './token-set';
import { createJWKS, verifyIdToken } from './verify-id-token';

const TOKEN_SET_CACHE_KEY = 'LOGTO_TOKEN_SET_CACHE';

export * from './storage';

export interface ConfigParameters {
  domain: string;
  clientId: string;
  storage?: ClientStorage;
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
  private readonly sessionManager: SessionManager;
  private readonly storage: ClientStorage;
  private tokenSet: Optional<TokenSet>;
  constructor(config: ConfigParameters, oidcConfiguration: OIDCConfiguration) {
    const { clientId, storage } = config;
    this.clientId = clientId;
    this.oidcConfiguration = oidcConfiguration;
    this.storage = storage ?? new LocalStorage();
    this.sessionManager = new SessionManager(this.storage);
    this.createTokenSetFromCache();
  }

  static async create(config: ConfigParameters): Promise<LogtoClient> {
    const client = new LogtoClient(config, await discover(`https://${config.domain}`));
    return client;
  }

  public async loginWithRedirect(redirectUri: string) {
    const { url, codeVerifier } = await getLoginUrlAndCodeVerifier(
      this.oidcConfiguration.authorization_endpoint,
      this.clientId,
      redirectUri
    );
    this.sessionManager.set({ redirectUri, codeVerifier });
    window.location.assign(url);
  }

  public async handleCallback(code: string) {
    const session = this.sessionManager.get();

    if (!session) {
      throw new Error('Session not found');
    }

    const { redirectUri, codeVerifier } = session;
    this.sessionManager.clear();
    const tokenParameters = await grantTokenByAuthorizationCode(
      this.oidcConfiguration.token_endpoint,
      code,
      redirectUri,
      codeVerifier
    );
    await verifyIdToken(
      createJWKS(this.oidcConfiguration.jwks_uri),
      tokenParameters.id_token,
      this.clientId
    );
    this.storage.setItem(this.tokenSetCacheKey, tokenParameters);
    this.tokenSet = new TokenSet(tokenParameters);
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

  public logout(redirectUri: string) {
    this.sessionManager.clear();
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
    return `${TOKEN_SET_CACHE_KEY}::${this.oidcConfiguration.issuer}::${this.clientId}`;
  }

  private createTokenSetFromCache() {
    const parameters = this.storage.getItem<TokenSetParameters>(this.tokenSetCacheKey);
    if (parameters) {
      this.tokenSet = new TokenSet(parameters);
    }
  }
}
