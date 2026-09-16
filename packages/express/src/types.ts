import type { GetContextParameters, LogtoConfig, SignInOptions } from '@logto/node';
import type { Request } from 'express';

declare module 'http' {
  // Honor module definition
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface IncomingMessage {
    session: Record<string, string | undefined>;
  }
}

export type AuthRouteSignInOptions = Omit<
  SignInOptions,
  'redirectUri' | 'postRedirectUri' | 'interactionMode'
>;

export type AuthRouteFlow = 'signIn' | 'signUp';

export type ResolveSignInOptions = (
  request: Request,
  flow: AuthRouteFlow
) => AuthRouteSignInOptions | Promise<AuthRouteSignInOptions>;

export type LogtoExpressConfig = LogtoConfig & {
  baseUrl: string;
  authRoutesPrefix?: string;
  /** Default options for sign-in and sign-up. Redirect fields are managed by the SDK. */
  signInOptions?: Omit<SignInOptions, 'redirectUri' | 'postRedirectUri'>;
  /** Returns request-specific options that override `signInOptions`. */
  resolveSignInOptions?: ResolveSignInOptions;
} & GetContextParameters;
