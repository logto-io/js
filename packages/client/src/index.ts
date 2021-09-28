import { Client, Issuer, generators, TokenSet, TokenSetParameters } from 'openid-client';

export interface ConfigParameters {
  logtoUrl: string;
  clientId: string;
}

export const extractBearerToken = (authorization: string): string => {
  if (
    !authorization ||
    typeof authorization !== 'string' ||
    (!authorization.startsWith('Bearer ') && !authorization.startsWith('bearer '))
  ) {
    throw new Error('Fail to extract bearer token');
  }

  const token = authorization.slice(7);
  return token;
};

export const ensureBasicOptions = (options?: ConfigParameters): ConfigParameters => {
  const { clientId, logtoUrl } = options || {};
  if (typeof logtoUrl !== 'string' || !logtoUrl.startsWith('http')) {
    throw new Error('Invalid logtoUrl');
  }

  if (typeof clientId !== 'string' || clientId.length === 0) {
    throw new Error('Need clientId');
  }

  return {
    clientId,
    logtoUrl,
  };
};

export const ensureTrailingSlash = (url: string): string => {
  if (url.endsWith('/')) {
    return url;
  }

  return url + '/';
};

export class LogtoClient {
  public oidcReady = false;
  public issuer: Issuer<Client> | null = null;
  private client: Client | null = null;
  private tokenSet: TokenSet | null = null;
  private readonly clientId: string;
  constructor(config: ConfigParameters, onOidcReady?: () => void) {
    const { logtoUrl, clientId } = ensureBasicOptions(config);
    this.clientId = clientId;

    void this.initIssuer(
      `${ensureTrailingSlash(logtoUrl)}oidc/.well-known/openid-configuration`,
      onOidcReady
    );
  }

  get authenticated(): boolean {
    if (!this.tokenSet) {
      return false;
    }

    if (this.tokenSet.expired()) {
      return false;
    }

    return true;
  }

  get token(): string {
    if (!this.authenticated || !this.tokenSet || !this.tokenSet.access_token) {
      throw new Error('Not authenticated');
    }

    return this.tokenSet.access_token;
  }

  get idToken(): string {
    if (!this.authenticated || !this.tokenSet || !this.tokenSet.id_token) {
      throw new Error('Not authenticated');
    }

    return this.tokenSet.id_token;
  }

  get subject(): string {
    if (!this.authenticated || !this.tokenSet) {
      throw new Error('Not authenticated');
    }

    return this.tokenSet.claims().sub;
  }

  public getClient(): Client {
    if (!this.issuer) {
      throw new Error('should init first');
    }

    if (!this.client) {
      this.client = new this.issuer.Client({
        client_id: this.clientId,
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
      });
    }

    return this.client;
  }

  public setToken(input: TokenSetParameters) {
    this.tokenSet = new TokenSet(input);
  }

  public getLoginUrlAndCodeVerifier(redirectUri: string): [string, string] {
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    const client = this.getClient();
    const url = client.authorizationUrl({
      scope: 'openid offline_access',
      prompt: 'consent',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      redirect_uri: redirectUri,
    });
    return [url, codeVerifier];
  }

  public async handleLoginCallback(redirectUri: string, codeVerifier: string, code: string) {
    const client = this.getClient();
    const tokenset = await client.callback(redirectUri, { code }, { code_verifier: codeVerifier });

    this.tokenSet = tokenset;

    return tokenset;
  }

  private async initIssuer(url: string, onOidcReady?: () => void) {
    this.issuer = await Issuer.discover(url);
    if (typeof onOidcReady === 'function') {
      onOidcReady();
    }
  }
}
