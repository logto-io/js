import { Optional } from '@silverhand/essentials';

import {
  discover,
  grantTokenByAuthorizationCode,
  grantTokenByRefreshToken,
  OIDCConfiguration,
  TokenSetParameters,
} from './api';
import { TOKEN_SET_CACHE_KEY } from './constants';
import SessionManager from './modules/session-manager';
import { ClientStorage, LocalStorage } from './modules/storage';
import TokenSet from './modules/token-set';
import { createDefaultOnRedirect } from './utils';
import { getLoginUrlWithCodeVerifierAndState, getLogoutUrl } from './utils/assembler';
import { generateScope } from './utils/generators';
import { createJWKS, verifyIdToken, IDToken } from './utils/id-token';
import { parseRedirectCallback } from './utils/parser';
import { createRequester, Requester } from './utils/requester';

export * from './modules/storage';

export type { IDToken };

export interface ConfigParameters {
  domain: string;
  clientId: string;
  scope?: string | string[];
  storage?: ClientStorage;
  customFetchFunction?: typeof fetch;
}

export default class LogtoClient {
  private readonly oidcConfiguration: OIDCConfiguration;
  private readonly clientId: string;
  private readonly scope: string;
  private readonly sessionManager: SessionManager;
  private readonly storage: ClientStorage;
  private readonly requester: Requester;
  private tokenSet: Optional<TokenSet>;
  constructor(config: ConfigParameters, oidcConfiguration: OIDCConfiguration) {
    const { clientId, scope, storage, customFetchFunction } = config;
    this.clientId = clientId;
    this.scope = generateScope(scope);
    this.oidcConfiguration = oidcConfiguration;
    this.storage = storage ?? new LocalStorage();
    this.sessionManager = new SessionManager(this.storage);
    this.requester = createRequester(customFetchFunction);
    this.createTokenSetFromCache();
  }

  static async create(config: ConfigParameters): Promise<LogtoClient> {
    return new LogtoClient(
      config,
      await discover(`https://${config.domain}`, createRequester(config.customFetchFunction))
    );
  }

  public async loginWithRedirect(
    redirectUri: string,
    onRedirect: (url: string) => void = createDefaultOnRedirect()
  ) {
    const { url, codeVerifier, state } = await getLoginUrlWithCodeVerifierAndState({
      baseUrl: this.oidcConfiguration.authorization_endpoint,
      clientId: this.clientId,
      scope: this.scope,
      redirectUri,
    });
    this.sessionManager.set({ redirectUri, codeVerifier, state });
    onRedirect(url);
  }

  public isLoginRedirect(url: string) {
    const { code, state, error } = parseRedirectCallback(url);
    if (error || !code || !state) {
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
    const { code, state, error, error_description } = parseRedirectCallback(url);

    if (error) {
      throw new Error(error_description ?? error);
    }

    if (!code) {
      throw new Error(`Authorization_code not found in url: ${url}`);
    }

    if (!state) {
      throw new Error(`State not found in url: ${url}`);
    }

    const session = this.sessionManager.get();

    if (!session) {
      throw new Error('Session not found');
    }

    const { redirectUri, codeVerifier, state: stateInStorage } = session;
    this.sessionManager.clear();

    if (state !== stateInStorage) {
      throw new Error('Unknown state');
    }

    const tokenParameters = await grantTokenByAuthorizationCode(
      {
        endpoint: this.oidcConfiguration.token_endpoint,
        clientId: this.clientId,
        code,
        redirectUri,
        codeVerifier,
      },
      this.requester
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

  public async getAccessToken() {
    if (!this.isAuthenticated || !this.tokenSet) {
      throw new Error('Not authenticated');
    }

    if (!this.tokenSet.expired()) {
      return this.tokenSet.accessToken;
    }

    const tokenParameters = await grantTokenByRefreshToken(
      {
        endpoint: this.oidcConfiguration.token_endpoint,
        clientId: this.clientId,
        refreshToken: this.tokenSet.refreshToken,
      },
      this.requester
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

  public logout(
    redirectUri: string,
    onRedirect: (url: string) => void = createDefaultOnRedirect()
  ) {
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
    onRedirect(url);
  }

  private get tokenSetCacheKey() {
    return encodeURIComponent(
      `${TOKEN_SET_CACHE_KEY}::${this.oidcConfiguration.issuer}::${this.clientId}::${this.scope}`
    );
  }

  private createTokenSetFromCache() {
    const parameters = this.storage.getItem<TokenSetParameters>(this.tokenSetCacheKey);
    if (parameters) {
      this.tokenSet = new TokenSet(parameters);
    }
  }
}
