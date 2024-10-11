import type { GetContextParameters, LogtoConfig, SignInOptions } from '@logto/node';

declare module 'http' {
  // Honor module definition
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface IncomingMessage {
    session: Record<string, string | undefined>;
  }
}

export type LogtoExpressConfig = LogtoConfig & {
  baseUrl: string;
  authRoutesPrefix?: string;
  signInOptions?: Omit<SignInOptions, 'redirectUri' | 'postRedirectUri'>;
} & GetContextParameters;
