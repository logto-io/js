import {
  CodeTokenResponse,
  createRequester,
  decodeIdToken,
  fetchOidcConfig,
  fetchTokenByAuthorizationCode,
  fetchTokenByRefreshToken,
  fetchUserInfo,
  generateCodeChallenge,
  generateCodeVerifier,
  generateSignInUri,
  generateSignOutUri,
  generateState,
  IdTokenClaims,
  OidcConfigResponse,
  Requester,
  revoke,
  UserInfoResponse,
  verifyAndParseCodeFromCallbackUri,
  verifyIdToken,
  withReservedScopes,
} from '@logto/js';
import { Nullable } from '@silverhand/essentials';
import { createRemoteJWKSet } from 'jose';
import { assert, Infer, string, type } from 'superstruct';

import { LogtoClientError } from './errors';
import {
  buildAccessTokenKey,
  getDiscoveryEndpoint,
  buildIdTokenKey,
  buildLogtoKey,
  buildRefreshTokenKey,
} from './utils';

export * from './errors';

export type LogtoConfig = {
  endpoint: string;
  clientId: string;
  scopes?: string[];
  resources?: string[];
  usingPersistStorage?: boolean;
};

export type AccessToken = {
  token: string;
  scope: string;
  expiresAt: number; // Unix Timestamp in seconds
};

export const LogtoSignInSessionItemSchema = type({
  redirectUri: string(),
  codeVerifier: string(),
  state: string(),
});

export type LogtoSignInSessionItem = Infer<typeof LogtoSignInSessionItemSchema>;

export default class LogtoClient {
  protected logtoConfig: LogtoConfig;
  protected oidcConfig?: OidcConfigResponse;

  protected logtoStorageKey: string;
  protected requester: Requester;

  protected accessTokenMap = new Map<string, AccessToken>();
  private _refreshToken: Nullable<string>;
  private _idToken: Nullable<string>;

  constructor(logtoConfig: LogtoConfig, requester = createRequester()) {
    this.logtoConfig = logtoConfig;
    this.logtoStorageKey = buildLogtoKey(logtoConfig.clientId);
    this.requester = requester;
    this._refreshToken = localStorage.getItem(buildRefreshTokenKey(this.logtoStorageKey));
    this._idToken = localStorage.getItem(buildIdTokenKey(this.logtoStorageKey));
  }

  public get isAuthenticated() {
    return Boolean(this.idToken);
  }

  protected get signInSession(): Nullable<LogtoSignInSessionItem> {
    const jsonItem = sessionStorage.getItem(this.logtoStorageKey);

    if (!jsonItem) {
      return null;
    }

    try {
      const item: unknown = JSON.parse(jsonItem);
      assert(item, LogtoSignInSessionItemSchema);

      return item;
    } catch (error: unknown) {
      throw new LogtoClientError('sign_in_session.invalid', error);
    }
  }

  protected set signInSession(logtoSignInSessionItem: Nullable<LogtoSignInSessionItem>) {
    if (!logtoSignInSessionItem) {
      sessionStorage.removeItem(this.logtoStorageKey);

      return;
    }

    const jsonItem = JSON.stringify(logtoSignInSessionItem);
    sessionStorage.setItem(this.logtoStorageKey, jsonItem);
  }

  private get refreshToken() {
    return this._refreshToken;
  }

  private set refreshToken(refreshToken: Nullable<string>) {
    this._refreshToken = refreshToken;

    const refreshTokenKey = buildRefreshTokenKey(this.logtoStorageKey);

    if (!refreshToken) {
      localStorage.removeItem(refreshTokenKey);

      return;
    }

    localStorage.setItem(refreshTokenKey, refreshToken);
  }

  private get idToken() {
    return this._idToken;
  }

  private set idToken(idToken: Nullable<string>) {
    this._idToken = idToken;

    const idTokenKey = buildIdTokenKey(this.logtoStorageKey);

    if (!idToken) {
      localStorage.removeItem(idTokenKey);

      return;
    }

    localStorage.setItem(idTokenKey, idToken);
  }

  public async getAccessToken(resource?: string): Promise<Nullable<string>> {
    if (!this.idToken) {
      throw new LogtoClientError('not_authenticated');
    }

    const accessTokenKey = buildAccessTokenKey(resource);
    const accessToken = this.accessTokenMap.get(accessTokenKey);

    if (accessToken && accessToken.expiresAt > Date.now() / 1000) {
      return accessToken.token;
    }

    // Token expired, remove it from the map
    if (accessToken) {
      this.accessTokenMap.delete(accessTokenKey);
    }

    // Fetch new access token by refresh token
    const { clientId } = this.logtoConfig;

    if (!this.refreshToken) {
      throw new LogtoClientError('not_authenticated');
    }

    try {
      const { tokenEndpoint } = await this.getOidcConfig();
      const { accessToken, refreshToken, idToken, scope, expiresIn } =
        await fetchTokenByRefreshToken(
          { clientId, tokenEndpoint, refreshToken: this.refreshToken, resource },
          this.requester
        );
      this.accessTokenMap.set(accessTokenKey, {
        token: accessToken,
        scope,
        expiresAt: Math.round(Date.now() / 1000) + expiresIn,
      });

      this.refreshToken = refreshToken;

      if (idToken) {
        await this.verifyIdToken(idToken);
        this.idToken = idToken;
      }

      return accessToken;
    } catch (error: unknown) {
      throw new LogtoClientError('get_access_token_by_refresh_token_failed', error);
    }
  }

  public getIdTokenClaims(): IdTokenClaims {
    if (!this.idToken) {
      throw new LogtoClientError('not_authenticated');
    }

    return decodeIdToken(this.idToken);
  }

  public async fetchUserInfo(): Promise<UserInfoResponse> {
    const { authorizationEndpoint } = await this.getOidcConfig();
    const accessToken = await this.getAccessToken();

    if (!accessToken) {
      throw new LogtoClientError('fetch_user_info_failed');
    }

    return fetchUserInfo(authorizationEndpoint, accessToken, this.requester);
  }

  public async signIn(redirectUri: string) {
    const { clientId, resources, scopes: customScopes } = this.logtoConfig;
    const { authorizationEndpoint } = await this.getOidcConfig();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();
    const scopes = withReservedScopes(customScopes).split(' ');

    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      scopes,
      resources,
    });

    this.signInSession = { redirectUri, codeVerifier, state };
    window.location.assign(signInUri);
  }

  public isSignInRedirected(url: string): boolean {
    const { signInSession } = this;

    if (!signInSession) {
      throw new LogtoClientError('sign_in_session.not_found');
    }
    const { redirectUri } = signInSession;

    return url.startsWith(redirectUri);
  }

  public async handleSignInCallback(callbackUri: string) {
    const { signInSession, logtoConfig, requester } = this;

    if (!signInSession) {
      throw new LogtoClientError('sign_in_session.not_found');
    }

    const { redirectUri, state, codeVerifier } = signInSession;
    const code = verifyAndParseCodeFromCallbackUri(callbackUri, redirectUri, state);

    const { clientId } = logtoConfig;
    const { tokenEndpoint } = await this.getOidcConfig();
    const codeTokenResponse = await fetchTokenByAuthorizationCode(
      {
        clientId,
        tokenEndpoint,
        redirectUri,
        codeVerifier,
        code,
      },
      requester
    );

    await this.verifyIdToken(codeTokenResponse.idToken);

    this.saveCodeToken(codeTokenResponse);
  }

  public async signOut(postLogoutRedirectUri?: string) {
    if (!this.idToken) {
      throw new LogtoClientError('not_authenticated');
    }

    const { clientId } = this.logtoConfig;
    const { endSessionEndpoint, revocationEndpoint } = await this.getOidcConfig();

    if (this.refreshToken) {
      try {
        await revoke(revocationEndpoint, clientId, this.refreshToken, this.requester);
      } catch {
        // Do nothing at this point, as we don't want to break the sign-out flow even if the revocation is failed
      }
    }

    const url = generateSignOutUri({
      endSessionEndpoint,
      postLogoutRedirectUri,
      idToken: this.idToken,
    });

    this.accessTokenMap.clear();
    this.refreshToken = null;
    this.idToken = null;

    window.location.assign(url);
  }

  private async getOidcConfig(): Promise<OidcConfigResponse> {
    if (!this.oidcConfig) {
      const { endpoint } = this.logtoConfig;
      const discoveryEndpoint = getDiscoveryEndpoint(endpoint);
      this.oidcConfig = await fetchOidcConfig(discoveryEndpoint, this.requester);
    }

    return this.oidcConfig;
  }

  private async verifyIdToken(idToken: string) {
    const { clientId } = this.logtoConfig;
    const { issuer, jwksUri } = await this.getOidcConfig();

    try {
      await verifyIdToken(idToken, clientId, issuer, createRemoteJWKSet(new URL(jwksUri)));
    } catch (error: unknown) {
      throw new LogtoClientError('invalid_id_token', error);
    }
  }

  private saveCodeToken({
    refreshToken,
    idToken,
    scope,
    accessToken,
    expiresIn,
  }: CodeTokenResponse) {
    this.refreshToken = refreshToken;
    this.idToken = idToken;

    // NOTE: Will add scope to accessTokenKey when needed. (Linear issue LOG-1589)
    const accessTokenKey = buildAccessTokenKey();
    const expiresAt = Date.now() / 1000 + expiresIn;
    this.accessTokenMap.set(accessTokenKey, { token: accessToken, scope, expiresAt });
  }
}
