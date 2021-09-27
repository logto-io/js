import { Client, Issuer, generators } from 'openid-client';

export interface ConfigParameters {
  logtoUrl: string;
  clientId: string;
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
  private readonly clientId: string;
  constructor(config: ConfigParameters, onOidcReady?: () => void) {
    const { logtoUrl, clientId } = ensureBasicOptions(config);
    this.clientId = clientId;

    void this.initIssuer(
      `${ensureTrailingSlash(logtoUrl)}oidc/.well-known/openid-configuration`,
      onOidcReady
    );
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

  public getLoginUrlAndCodeVerifier(): [string, string] {
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

  public async handleLoginCallback(redirectUrl: string, codeVerifier: string, code: string) {
    const client = this.getClient();
    const tokenset = await client.callback(redirectUrl, { code }, { code_verifier: codeVerifier });
    return tokenset;
  }

  private async initIssuer(url: string, onOidcReady?: () => void) {
    this.issuer = await Issuer.discover(url);
    if (typeof onOidcReady === 'function') {
      onOidcReady();
    }
  }
}
