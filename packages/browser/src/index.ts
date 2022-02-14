import {
  fetchOidcConfig,
  generateCodeChallenge,
  generateCodeVerifier,
  generateSignInUri,
  generateState,
  OidcConfigResponse,
  Requester,
  withReservedScopes,
} from '@logto/js';

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

export default class LogtoClient {
  protected accessTokenMap = new Map<string, AccessToken>();
  protected refreshToken?: string;
  protected idToken?: string;
  protected logtoConfig: LogtoConfig;
  protected oidcConfig?: OidcConfigResponse;

  constructor(logtoConfig: LogtoConfig) {
    this.logtoConfig = logtoConfig;
  }

  public get isAuthenticated() {
    return Boolean(this.idToken);
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

    // TODO: save redirectUri, codeVerifier and state
    window.location.assign(signInUri);
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
