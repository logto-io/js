import { discoverOpenIDConfiguration, OpenIdConfiguration } from './discovery';

export interface ConfigParameters {
  discoveryUrl: string;
  clientId: string;
}

export interface UserResponse {
  id: string;
  // TODO 用户信息返回待确定
}

export const validateUser = async (accessToken: string): Promise<UserResponse> => {
  // TODO 替换成真实的校验
  if (accessToken === 'test-user-token') {
    return {
      id: 'test-user',
    };
  }

  return null;
};

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
  private readonly clientId: string;
  private openIdConfiguration: OpenIdConfiguration;
  constructor(config: ConfigParameters) {
    const { discoveryUrl, clientId } = ensureBasicOptions(config);
    this.clientId = clientId;

    void this.discoverOpenIdConfiguration(discoveryUrl);
  }

  public getOpenIdConfiguration() {
    return this.openIdConfiguration;
  }

  private async discoverOpenIdConfiguration(url: string) {
    this.openIdConfiguration = await discoverOpenIDConfiguration(url);
  }
}
