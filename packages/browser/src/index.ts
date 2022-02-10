import { OidcConfigResponse, Requester } from '@logto/js';

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
}
