import { IdTokenClaims } from '@logto/client';

declare module 'http' {
  interface IncomingMessage {
    user: LogtoContext;
  }
}

export type LogtoContext = {
  isAuthenticated: boolean;
  claims?: IdTokenClaims;
  accessToken?: string;
};
