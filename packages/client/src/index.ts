import { Client, Issuer, generators } from 'openid-client';

export interface ConfigParameters {
  discoveryUrl: string;
  clientId: string;
  redirectUris?: string[];
}

export const extractBearerToken = (authorization: string): string | null => {
  if (
    !authorization ||
    typeof authorization !== 'string' ||
    (!authorization.startsWith('Bearer ') && !authorization.startsWith('bearer '))
  ) {
    return null;
  }

  const token = authorization.slice(7);
  return token;
};

export const ensureBasicOptions = (options?: ConfigParameters): ConfigParameters => {
  const { clientId, discoveryUrl, redirectUris } = options || {};
  if (typeof discoveryUrl !== 'string' || !discoveryUrl.startsWith('http')) {
    throw new Error('Invalid discoveryUrl');
  }

  if (typeof clientId !== 'string' || clientId.length === 0) {
    throw new Error('Need clientId');
  }

  if (redirectUris) {
    if (!Array.isArray(redirectUris)) {
      throw new TypeError('RedirectUris should be an array of strings');
    }

    for (const uri of redirectUris) {
      if (typeof uri !== 'string') {
        throw new TypeError('RedirectUris should be an array of strings');
      }
    }
  }

  return {
    clientId,
    discoveryUrl,
    redirectUris,
  };
};

export class LogtoClient {
  public oidcReady = false;
  public issuer: Issuer<Client> | null = null;
  private client: Client | null = null;
  private readonly clientId: string;
  private readonly redirectUris: string[];
  constructor(config: ConfigParameters, onOidcReady?: () => void) {
    const { discoveryUrl, clientId, redirectUris } = ensureBasicOptions(config);
    this.clientId = clientId;
    this.redirectUris = redirectUris || [];

    void this.initIssuer(discoveryUrl, onOidcReady);
  }

  public getClient(): Client {
    if (!this.issuer) {
      throw new Error('should init first');
    }

    if (!this.client) {
      this.client = new this.issuer.Client({
        client_id: this.clientId,
        redirect_uris: this.redirectUris,
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
      });
    }

    return this.client;
  }

  public getLoginUrlAndCodeVerifier(): [string, string] {
    if (this.redirectUris.length === 0) {
      throw new Error('RedirectUris is need for calling loginWithRedirect');
    }

    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    const client = this.getClient();
    const url = client.authorizationUrl({
      scope: 'openid offline_access',
      prompt: 'consent',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    return [url, codeVerifier];
  }

  public async handleLoginCallback(codeVerifier: string, code: string) {
    const client = this.getClient();
    const tokenset = await client.callback(
      this.redirectUris[0],
      { code },
      { code_verifier: codeVerifier }
    );
    return tokenset;
  }

  private async initIssuer(url: string, onOidcReady?: () => void) {
    this.issuer = await Issuer.discover(url);
    if (typeof onOidcReady === 'function') {
      onOidcReady();
    }
  }
}
