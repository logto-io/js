import type {
  CodeTokenResponse,
  IdTokenClaims,
  UserInfoResponse,
  InteractionMode,
} from '@logto/js';
import {
  decodeIdToken,
  fetchOidcConfig,
  fetchTokenByAuthorizationCode,
  fetchTokenByRefreshToken,
  fetchUserInfo,
  generateSignInUri,
  generateSignOutUri,
  Prompt,
  revoke,
  verifyAndParseCodeFromCallbackUri,
  verifyIdToken,
  withDefaultScopes,
} from '@logto/js';
import type { Nullable } from '@silverhand/essentials';
import { createRemoteJWKSet } from 'jose';

import type { ClientAdapter } from './adapter.js';
import { LogtoClientError } from './errors.js';
import type { AccessToken, LogtoConfig, LogtoSignInSessionItem } from './types/index.js';
import { isLogtoAccessTokenMap, isLogtoSignInSessionItem } from './types/index.js';
import { buildAccessTokenKey, getDiscoveryEndpoint } from './utils/index.js';
import { once } from './utils/once.js';

export type { IdTokenClaims, LogtoErrorCode, UserInfoResponse, InteractionMode } from '@logto/js';
export {
  LogtoError,
  OidcError,
  Prompt,
  LogtoRequestError,
  ReservedScope,
  UserScope,
} from '@logto/js';
export * from './errors.js';
export type { Storage, StorageKey, ClientAdapter } from './adapter.js';
export { createRequester } from './utils/index.js';
export * from './types/index.js';

export default class LogtoClient {
  protected readonly logtoConfig: LogtoConfig;
  protected readonly getOidcConfig: typeof this._getOidcConfig = once(this._getOidcConfig);
  protected readonly getJwtVerifyGetKey = once(this._getJwtVerifyGetKey);
  protected readonly adapter: ClientAdapter;
  protected readonly accessTokenMap = new Map<string, AccessToken>();

  constructor(logtoConfig: LogtoConfig, adapter: ClientAdapter) {
    this.logtoConfig = {
      ...logtoConfig,
      prompt: logtoConfig.prompt ?? Prompt.Consent,
      scopes: withDefaultScopes(logtoConfig.scopes).split(' '),
    };
    this.adapter = adapter;

    void this.loadAccessTokenMap();
  }

  async isAuthenticated() {
    return Boolean(await this.getIdToken());
  }

  async getRefreshToken() {
    return this.adapter.storage.getItem('refreshToken');
  }

  async getIdToken() {
    return this.adapter.storage.getItem('idToken');
  }

  async getAccessToken(resource?: string): Promise<string> {
    if (!(await this.getIdToken())) {
      throw new LogtoClientError('not_authenticated');
    }

    const accessTokenKey = buildAccessTokenKey(resource);
    const accessToken = this.accessTokenMap.get(accessTokenKey);

    if (accessToken && accessToken.expiresAt > Date.now() / 1000) {
      return accessToken.token;
    }

    // Since the access token has expired, delete it from the map.
    if (accessToken) {
      this.accessTokenMap.delete(accessTokenKey);
    }

    /**
     * Need to fetch a new access token using refresh token.
     */
    return this.getAccessTokenByRefreshToken(resource);
  }

  async getIdTokenClaims(): Promise<IdTokenClaims> {
    const idToken = await this.getIdToken();

    if (!idToken) {
      throw new LogtoClientError('not_authenticated');
    }

    return decodeIdToken(idToken);
  }

  async fetchUserInfo(): Promise<UserInfoResponse> {
    const { userinfoEndpoint } = await this.getOidcConfig();
    const accessToken = await this.getAccessToken();

    if (!accessToken) {
      throw new LogtoClientError('fetch_user_info_failed');
    }

    return fetchUserInfo(userinfoEndpoint, accessToken, this.adapter.requester);
  }

  async signIn(redirectUri: string, interactionMode?: InteractionMode) {
    const { appId: clientId, prompt, resources, scopes } = this.logtoConfig;
    const { authorizationEndpoint } = await this.getOidcConfig();
    const codeVerifier = this.adapter.generateCodeVerifier();
    const codeChallenge = await this.adapter.generateCodeChallenge(codeVerifier);
    const state = this.adapter.generateState();

    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      scopes,
      resources,
      prompt,
      interactionMode,
    });

    await this.setSignInSession({ redirectUri, codeVerifier, state });
    await this.setRefreshToken(null);
    await this.setIdToken(null);

    this.adapter.navigate(signInUri);
  }

  async isSignInRedirected(url: string): Promise<boolean> {
    const signInSession = await this.getSignInSession();

    if (!signInSession) {
      return false;
    }
    const { redirectUri } = signInSession;
    const { origin, pathname } = new URL(url);

    return `${origin}${pathname}` === redirectUri;
  }

  async handleSignInCallback(callbackUri: string) {
    const { logtoConfig, adapter } = this;
    const { requester } = adapter;
    const signInSession = await this.getSignInSession();

    if (!signInSession) {
      throw new LogtoClientError('sign_in_session.not_found');
    }

    const { redirectUri, state, codeVerifier } = signInSession;
    const code = verifyAndParseCodeFromCallbackUri(callbackUri, redirectUri, state);

    const { appId: clientId } = logtoConfig;
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
    await this.saveCodeToken(codeTokenResponse);
    await this.setSignInSession(null);
  }

  async signOut(postLogoutRedirectUri?: string) {
    const { appId: clientId } = this.logtoConfig;
    const { endSessionEndpoint, revocationEndpoint } = await this.getOidcConfig();
    const refreshToken = await this.getRefreshToken();

    if (refreshToken) {
      try {
        await revoke(revocationEndpoint, clientId, refreshToken, this.adapter.requester);
      } catch {
        // Do nothing at this point, as we don't want to break the sign-out flow even if the revocation is failed
      }
    }

    const url = generateSignOutUri({
      endSessionEndpoint,
      postLogoutRedirectUri,
      clientId,
    });

    this.accessTokenMap.clear();
    await this.setRefreshToken(null);
    await this.setIdToken(null);
    await this.adapter.storage.removeItem('accessToken');

    this.adapter.navigate(url);
  }

  protected async getSignInSession(): Promise<Nullable<LogtoSignInSessionItem>> {
    const jsonItem = await this.adapter.storage.getItem('signInSession');

    if (!jsonItem) {
      return null;
    }

    const item: unknown = JSON.parse(jsonItem);

    if (!isLogtoSignInSessionItem(item)) {
      throw new LogtoClientError('sign_in_session.invalid');
    }

    return item;
  }

  protected async setSignInSession(logtoSignInSessionItem: Nullable<LogtoSignInSessionItem>) {
    if (!logtoSignInSessionItem) {
      await this.adapter.storage.removeItem('signInSession');

      return;
    }

    const jsonItem = JSON.stringify(logtoSignInSessionItem);
    await this.adapter.storage.setItem('signInSession', jsonItem);
  }

  private async setIdToken(idToken: Nullable<string>) {
    if (!idToken) {
      await this.adapter.storage.removeItem('idToken');

      return;
    }

    await this.adapter.storage.setItem('idToken', idToken);
  }

  private async setRefreshToken(refreshToken: Nullable<string>) {
    if (!refreshToken) {
      await this.adapter.storage.removeItem('refreshToken');

      return;
    }

    await this.adapter.storage.setItem('refreshToken', refreshToken);
  }

  private async getAccessTokenByRefreshToken(resource?: string): Promise<string> {
    const currentRefreshToken = await this.getRefreshToken();

    if (!currentRefreshToken) {
      throw new LogtoClientError('not_authenticated');
    }

    const accessTokenKey = buildAccessTokenKey(resource);
    const { appId: clientId } = this.logtoConfig;
    const { tokenEndpoint } = await this.getOidcConfig();
    const { accessToken, refreshToken, idToken, scope, expiresIn } = await fetchTokenByRefreshToken(
      {
        clientId,
        tokenEndpoint,
        refreshToken: currentRefreshToken,
        resource,
      },
      this.adapter.requester
    );

    this.accessTokenMap.set(accessTokenKey, {
      token: accessToken,
      scope,
      expiresAt: Math.round(Date.now() / 1000) + expiresIn,
    });

    await this.saveAccessTokenMap();
    await this.setRefreshToken(refreshToken);

    if (idToken) {
      await this.verifyIdToken(idToken);
      await this.setIdToken(idToken);
    }

    return accessToken;
  }

  private async _getOidcConfig() {
    const { endpoint } = this.logtoConfig;
    const discoveryEndpoint = getDiscoveryEndpoint(endpoint);

    return fetchOidcConfig(discoveryEndpoint, this.adapter.requester);
  }

  private async _getJwtVerifyGetKey() {
    const { jwksUri } = await this.getOidcConfig();

    return createRemoteJWKSet(new URL(jwksUri));
  }

  private async verifyIdToken(idToken: string) {
    const { appId } = this.logtoConfig;
    const { issuer } = await this.getOidcConfig();
    const jwtVerifyGetKey = await this.getJwtVerifyGetKey();

    await verifyIdToken(idToken, appId, issuer, jwtVerifyGetKey);
  }

  private async saveCodeToken({
    refreshToken,
    idToken,
    scope,
    accessToken,
    expiresIn,
  }: CodeTokenResponse) {
    await this.setRefreshToken(refreshToken ?? null);
    await this.setIdToken(idToken);

    // NOTE: Will add scope to accessTokenKey when needed. (Linear issue LOG-1589)
    const accessTokenKey = buildAccessTokenKey();
    const expiresAt = Date.now() / 1000 + expiresIn;
    this.accessTokenMap.set(accessTokenKey, { token: accessToken, scope, expiresAt });
    await this.saveAccessTokenMap();
  }

  private async saveAccessTokenMap() {
    const data: Record<string, AccessToken> = {};

    for (const [key, accessToken] of this.accessTokenMap.entries()) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      data[key] = accessToken;
    }

    await this.adapter.storage.setItem('accessToken', JSON.stringify(data));
  }

  private async loadAccessTokenMap() {
    const raw = await this.adapter.storage.getItem('accessToken');

    if (!raw) {
      return;
    }

    try {
      const json: unknown = JSON.parse(raw);

      if (!isLogtoAccessTokenMap(json)) {
        return;
      }
      this.accessTokenMap.clear();

      for (const [key, accessToken] of Object.entries(json)) {
        this.accessTokenMap.set(key, accessToken);
      }
    } catch (error: unknown) {
      console.warn(error);
    }
  }
}
