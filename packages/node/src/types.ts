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
};

export type GetContextParameters = {
  fetchUserInfo?: boolean;
  getAccessToken?: boolean;
  resource?: string;
};
