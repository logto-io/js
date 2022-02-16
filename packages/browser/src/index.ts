import {
  createRequester,
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
import { Nullable, Optional } from '@silverhand/essentials';
import { assert, Infer, string, type } from 'superstruct';

import { LogtoClientError } from './errors';
import { getDiscoveryEndpoint, getLogtoKey } from './utils';

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
    this.logtoStorageKey = getLogtoKey(logtoConfig.clientId);
    this.requester = requester;
    this.refreshToken = localStorage.getItem(`${this.logtoStorageKey}:refreshToken`);
    this.idToken = localStorage.getItem(`${this.logtoStorageKey}:idToken`);
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
      return;
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

    localStorage.removeItem(`${this.logtoStorageKey}:idToken`);
    localStorage.removeItem(`${this.logtoStorageKey}:refreshToken`);

    this.accessTokenMap.clear();
    this.refreshToken = null;
    this.idToken = null;

    window.location.assign(url);
  }

  protected async getOidcConfig(): Promise<OidcConfigResponse> {
    if (!this.oidcConfig) {
      const { endpoint } = this.logtoConfig;
      const discoveryEndpoint = getDiscoveryEndpoint(endpoint);
      this.oidcConfig = await fetchOidcConfig(discoveryEndpoint, this.requester);
    }

    return this.oidcConfig;
  }
}
