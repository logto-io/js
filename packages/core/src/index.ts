import { discoverOpenIDConfiguration, OpenIdConfiguration } from './discovery';
import { fetchJwks, JWK } from './jwt';

export interface ConfigParameters {
  discoveryUrl: string;
  clientId: string;
}

export const extractBearerToken = (authorization: string): string => {
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
  const { clientId, discoveryUrl } = options || {};
  if (typeof discoveryUrl !== 'string' || !discoveryUrl.startsWith('http')) {
    throw new Error('Invalid discoveryUrl');
  }

  if (typeof clientId !== 'string' || clientId.length === 0) {
    throw new Error('Need clientId');
  }

  return {
    clientId,
    discoveryUrl,
  };
};

export class LogtoClient {
  public oidcReady = false;
  private readonly clientId: string;
  private openIdConfiguration: OpenIdConfiguration;
  private jwks: JWK[];
  constructor(config: ConfigParameters, onOidcReady?: () => void) {
    const { discoveryUrl, clientId } = ensureBasicOptions(config);
    this.clientId = clientId;

    void this.initOIDC(discoveryUrl, onOidcReady);
  }

  public getOpenIdConfiguration() {
    return { ...this.openIdConfiguration };
  }

  public getJWKS() {
    return { ...this.jwks };
  }

  private async initOIDC(discoveryUrl: string, onOidcReady?: () => void) {
    await this.discoverOpenIdConfiguration(discoveryUrl);
    await this.fetchJwks();
    if (typeof onOidcReady === 'function') {
      onOidcReady();
    }
  }

  private async discoverOpenIdConfiguration(url: string) {
    this.openIdConfiguration = await discoverOpenIDConfiguration(url);
  }

  private async fetchJwks() {
    this.jwks = await fetchJwks(this.openIdConfiguration.jwks_uri);
  }
}
