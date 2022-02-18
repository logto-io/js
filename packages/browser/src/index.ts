import {
  createRequester,
  decodeIdToken,
  fetchOidcConfig,
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
  verifyIdToken,
  withReservedScopes,
} from '@logto/js';
import { Nullable, Optional } from '@silverhand/essentials';
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
  protected accessTokenMap = new Map<string, AccessToken>();
  protected refreshToken: Nullable<string>;
  protected idToken: Nullable<string>;
  protected logtoConfig: LogtoConfig;
  protected oidcConfig?: OidcConfigResponse;
  protected logtoStorageKey: string;
  protected requester: Requester;

  constructor(logtoConfig: LogtoConfig, requester = createRequester()) {
    this.logtoConfig = logtoConfig;
    this.logtoStorageKey = buildLogtoKey(logtoConfig.clientId);
    this.requester = requester;
    this.refreshToken = localStorage.getItem(buildRefreshTokenKey(this.logtoStorageKey));
    this.idToken = localStorage.getItem(buildIdTokenKey(this.logtoStorageKey));
  }

  public get isAuthenticated() {
    return Boolean(this.idToken);
  }

  protected get signInSession(): Optional<LogtoSignInSessionItem> {
    const jsonItem = sessionStorage.getItem(this.logtoStorageKey);

    if (!jsonItem) {
      return undefined;
    }

    try {
      const item: unknown = JSON.parse(jsonItem);
      assert(item, LogtoSignInSessionItemSchema);

      return item;
    } catch (error: unknown) {
      throw new LogtoClientError('sign_in_session.invalid', error);
    }
  }

  protected set signInSession(logtoSignInSessionItem: Optional<LogtoSignInSessionItem>) {
    if (!logtoSignInSessionItem) {
      sessionStorage.removeItem(this.logtoStorageKey);

      return;
    }

    const jsonItem = JSON.stringify(logtoSignInSessionItem);
    sessionStorage.setItem(this.logtoStorageKey, jsonItem);
  }

  public async getAccessToken(resource?: string): Promise<Optional<string>> {
    if (!this.idToken) {
      throw new LogtoClientError('not_authenticated');
    }

    const accessTokenKey = buildAccessTokenKey(resource);
    const accessToken = this.accessTokenMap.get(accessTokenKey);

    if (accessToken && accessToken.expiresAt > Date.now()) {
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

      localStorage.setItem(buildRefreshTokenKey(this.logtoStorageKey), refreshToken);
      this.refreshToken = refreshToken;

      if (idToken) {
        await this.verifyIdToken(idToken);
        localStorage.setItem(buildIdTokenKey(this.logtoStorageKey), idToken);
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

    localStorage.removeItem(buildRefreshTokenKey(this.logtoStorageKey));
    localStorage.removeItem(buildIdTokenKey(this.logtoStorageKey));

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
}
