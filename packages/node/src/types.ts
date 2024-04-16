import type { IdTokenClaims, UserInfoResponse } from '@logto/client';

declare module 'http' {
  // Honor module definition
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface IncomingMessage {
    user: LogtoContext;
  }
}

export type LogtoContext = {
  isAuthenticated: boolean;
  claims?: IdTokenClaims;
  accessToken?: string;
  userInfo?: UserInfoResponse;
  scopes?: string[];
  organizationTokens?: Record<string, string>;
};

export type GetContextParameters = {
  fetchUserInfo?: boolean;
  getAccessToken?: boolean;
  /** The optional `organization_id` param for granting access token. */
  accessTokenOrganizationId?: string;
  resource?: string;
  getOrganizationToken?: boolean;
};
