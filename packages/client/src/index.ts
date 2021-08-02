import { Client, Issuer } from 'openid-client';

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
  public issuer: Issuer<Client>;
  private readonly clientId: string;
  constructor(config: ConfigParameters, onOidcReady?: () => void) {
    const { discoveryUrl, clientId } = ensureBasicOptions(config);
    this.clientId = clientId;

    void this.initIssuer(discoveryUrl, onOidcReady);
  }

  private async initIssuer(url: string, onOidcReady?: () => void) {
    this.issuer = await Issuer.discover(url);
    if (typeof onOidcReady === 'function') {
      onOidcReady();
    }
  }
}
