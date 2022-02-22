import { Optional } from '@silverhand/essentials';

import {
  discover,
  grantTokenByAuthorizationCode,
  grantTokenByRefreshToken,
  OidcConfigResponse,
  TokenResponse,
} from './api';
import { TOKEN_SET_CACHE_KEY } from './constants';
import SessionManager from './modules/session-manager';
import { ClientStorage, LocalStorage } from './modules/storage';
import TokenSet from './modules/token-set';
import { createDefaultOnRedirect } from './utils';
import { getLoginUrlWithCodeVerifierAndState, getLogoutUrl } from './utils/assembler';
import { generateScope } from './utils/generators';
import { createJWKS, verifyIdToken } from './utils/id-token';
import { parseRedirectCallback } from './utils/parser';
import { createRequester, Requester } from './utils/requester';

export type { IdTokenClaims } from './utils/id-token';

export * from './modules/storage';

export interface ConfigParameters {
  domain: string;
  clientId: string;
  scope?: string | string[];
  storage?: ClientStorage;
  customFetchFunction?: typeof fetch;
}

export default class LogtoClient {
  static async create(config: ConfigParameters): Promise<LogtoClient> {
    return new LogtoClient(
      config,
      await discover(`https://${config.domain}`, createRequester(config.customFetchFunction))
    );
  }

  public readonly oidcConfig: OidcConfigResponse;
  public readonly clientId: string;
  public readonly scope: string;
  public readonly sessionManager: SessionManager;
  public readonly storage: ClientStorage;
  private readonly requester: Requester;
  private tokenSet: Optional<TokenSet>;
  constructor(config: ConfigParameters, oidcConfig: OidcConfigResponse) {
    const { clientId, scope, storage, customFetchFunction } = config;
    this.clientId = clientId;
    this.scope = generateScope(scope);
    this.oidcConfig = oidcConfig;
    this.storage = storage ?? new LocalStorage();
    this.sessionManager = new SessionManager(this.storage);
    this.requester = createRequester(customFetchFunction);
    this.createTokenSetFromCache();
  }

  private get tokenSetCacheKey() {
    return encodeURIComponent(
      `${TOKEN_SET_CACHE_KEY}::${this.oidcConfig.issuer}::${this.clientId}::${this.scope}`
    );
  }

  public async loginWithRedirect(
    redirectUri: string,
    onRedirect: (url: string) => void = createDefaultOnRedirect()
  ) {
    const { url, codeVerifier, state } = await getLoginUrlWithCodeVerifierAndState({
      baseUrl: this.oidcConfig.authorization_endpoint,
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

    const tokenResponse = await grantTokenByAuthorizationCode(
      {
        endpoint: this.oidcConfig.token_endpoint,
        clientId: this.clientId,
        code,
        redirectUri,
        codeVerifier,
      },
      this.requester
    );

    await verifyIdToken(
      createJWKS(this.oidcConfig.jwks_uri),
      tokenResponse.id_token,
      this.clientId
    );

    this.storage.setItem(this.tokenSetCacheKey, tokenResponse);
    this.tokenSet = new TokenSet(tokenResponse);
  }

  public getClaims() {
    if (!this.isAuthenticated() || !this.tokenSet) {
      throw new Error('Not authenticated');
    }

    return this.tokenSet.claims();
  }

  public isAuthenticated() {
    return Boolean(this.tokenSet);
  }

  public async getAccessToken() {
    if (!this.isAuthenticated() || !this.tokenSet) {
      throw new Error('Not authenticated');
    }

    if (!this.tokenSet.expired()) {
      return this.tokenSet.accessToken;
    }

    const tokenResponse = await grantTokenByRefreshToken(
      {
        endpoint: this.oidcConfig.token_endpoint,
        clientId: this.clientId,
        refreshToken: this.tokenSet.refreshToken,
      },
      this.requester
    );
    await verifyIdToken(
      createJWKS(this.oidcConfig.jwks_uri),
      tokenResponse.id_token,
      this.clientId
    );
    this.storage.setItem(this.tokenSetCacheKey, tokenResponse);
    this.tokenSet = new TokenSet(tokenResponse);

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
      this.oidcConfig.end_session_endpoint,
      this.tokenSet.idToken,
      redirectUri
    );
    this.tokenSet = undefined;
    this.storage.removeItem(this.tokenSetCacheKey);
    onRedirect(url);
  }

  private createTokenSetFromCache() {
    const parameters = this.storage.getItem<TokenResponse>(this.tokenSetCacheKey);

    if (parameters) {
      this.tokenSet = new TokenSet(parameters);
    }
  }
}
