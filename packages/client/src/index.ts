import { Optional } from '@silverhand/essentials';
import { Client, Issuer, generators, TokenSet, TokenSetParameters } from 'openid-client';

export interface ConfigParameters {
  logtoUrl: string;
  clientId: string;
}

export const extractBearerToken = (authorization: string): string => {
  if (
    !authorization ||
    (!authorization.startsWith('Bearer ') && !authorization.startsWith('bearer '))
  ) {
    throw new Error('Fail to extract bearer token');
  }

  const token = authorization.slice(7);
  return token;
};

export const appendSlashIfNeeded = (url: string): string => {
  if (url.endsWith('/')) {
    return url;
  }

  return url + '/';
};

export class LogtoClient {
  public oidcReady = false;
  public issuer: Optional<Issuer<Client>>;
  private client: Optional<Client>;
  private tokenSet: Optional<TokenSet>;
  private readonly clientId: string;
  constructor(config: ConfigParameters, onOidcReady?: () => void) {
    const { logtoUrl, clientId } = config;
    this.clientId = clientId;

    void this.initIssuer(
      `${appendSlashIfNeeded(logtoUrl)}oidc/.well-known/openid-configuration`,
      onOidcReady
    );
  }

  get isAuthenticated(): boolean {
    return !this.tokenSet?.expired();
  }

  get accessToken(): string {
    if (!this.isAuthenticated || !this.tokenSet?.access_token) {
      throw new Error('Not authenticated');
    }

    return this.tokenSet.access_token;
  }

  get idToken(): string {
    if (!this.isAuthenticated || !this.tokenSet?.id_token) {
      throw new Error('Not authenticated');
    }

    return this.tokenSet.id_token;
  }

  get subject(): string {
    if (!this.isAuthenticated || !this.tokenSet) {
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
    this.tokenSet = await client.callback(redirectUri, { code }, { code_verifier: codeVerifier });

    return this.tokenSet;
  }

  private async initIssuer(url: string, onOidcReady?: () => void) {
    this.issuer = await Issuer.discover(url);
    if (typeof onOidcReady === 'function') {
      onOidcReady();
    }
  }
}
