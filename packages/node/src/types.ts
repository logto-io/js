import { IdTokenClaims } from '@logto/client';

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
};
