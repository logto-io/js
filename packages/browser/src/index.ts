import {
  fetchOidcConfig,
  generateCodeChallenge,
  generateCodeVerifier,
  generateSignInUri,
  generateSignOutUri,
  generateState,
  OidcConfigResponse,
  Requester,
  revoke,
  withReservedScopes,
} from '@logto/js';
import { Optional } from '@silverhand/essentials';
import { assert, Infer, string, type } from 'superstruct';

import { LogtoClientError } from './errors';

const discoveryPath = '/oidc/.well-known/openid-configuration';
const logtoStorageItemKeyPrefix = `logto`;

export const getLogtoKey = (key: string) => `${logtoStorageItemKeyPrefix}:${key}`;

export type LogtoConfig = {
  endpoint: string;
  clientId: string;
  scopes?: string[];
  resources?: string[];
  usingPersistStorage?: boolean;
  requester: Requester;
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
  protected refreshToken?: string;
  protected idToken?: string;
  protected logtoConfig: LogtoConfig;
  protected oidcConfig?: OidcConfigResponse;
  protected logtoSignInSessionKey: string;

  constructor(logtoConfig: LogtoConfig) {
    this.logtoConfig = logtoConfig;
    this.logtoSignInSessionKey = getLogtoKey(logtoConfig.clientId);
  }

  public get isAuthenticated() {
    return Boolean(this.idToken);
  }

  protected get signInSession(): Optional<LogtoSignInSessionItem> {
    const jsonItem = sessionStorage.getItem(this.logtoSignInSessionKey);

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
      sessionStorage.removeItem(this.logtoSignInSessionKey);

      return;
    }

    const jsonItem = JSON.stringify(logtoSignInSessionItem);
    sessionStorage.setItem(this.logtoSignInSessionKey, jsonItem);
  }

  public async signIn(redirectUri: string) {
    const { clientId, resources, scopes: customScopes } = this.logtoConfig;
    const oidcConfig = await this.getOidcConfig();

    const { authorizationEndpoint } = oidcConfig;
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
      return;
    }

    const { clientId, requester } = this.logtoConfig;
    const { endSessionEndpoint, revocationEndpoint } = await this.getOidcConfig();
    const logtoKey = getLogtoKey(clientId);

    if (this.refreshToken) {
      try {
        await revoke(revocationEndpoint, clientId, this.refreshToken, requester);
      } catch {
        // Do nothing at this point, as we don't want to break the sign out flow even if the revocation is failed
      }
    }

    const url = generateSignOutUri({
      endSessionEndpoint,
      postLogoutRedirectUri,
      idToken: this.idToken,
    });

    localStorage.removeItem(`${logtoKey}:idToken`);
    localStorage.removeItem(`${logtoKey}:refreshToken`);

    this.accessTokenMap.clear();
    this.idToken = undefined;
    this.refreshToken = undefined;

    window.location.assign(url);
  }

  protected async getOidcConfig(): Promise<OidcConfigResponse> {
    if (!this.oidcConfig) {
      const { endpoint, requester } = this.logtoConfig;
      const discoveryEndpoint = new URL(discoveryPath, endpoint);
      this.oidcConfig = await fetchOidcConfig(discoveryEndpoint.toString(), requester);
    }

    return this.oidcConfig;
  }
}

export * from './errors';
