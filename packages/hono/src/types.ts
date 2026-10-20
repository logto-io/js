import type { GetContextParameters, LogtoConfig, LogtoContext, SignInOptions } from '@logto/node';
import type { Context } from 'hono';

/**
 * The Hono environment variables added by the Logto middleware. Use it to type your Hono app:
 *
 * ```ts
 * const app = new Hono<{ Variables: LogtoVariables }>();
 * ```
 */
export type LogtoVariables = {
  logto: LogtoContext;
};

export type AuthRouteSignInOptions = Omit<
  SignInOptions,
  'redirectUri' | 'postRedirectUri' | 'interactionMode'
>;

export type AuthRouteFlow = 'signIn' | 'signUp';

export type GetSignInOptions = (
  context: Context<{ Variables: LogtoVariables }>,
  flow: AuthRouteFlow
) => AuthRouteSignInOptions | Promise<AuthRouteSignInOptions>;

export type HandleAuthRoutesOptions = {
  /** Returns request-specific options that override `signInOptions`. */
  getSignInOptions?: GetSignInOptions;
};

export type LogtoHonoConfig = LogtoConfig &
  GetContextParameters & {
    /** The base URL of your application, used as the redirect target after sign-in. */
    baseUrl: string;
    /** The path prefix of the auth routes. Defaults to `logto`. */
    authRoutesPrefix?: string;
    /** Default options for sign-in and sign-up. Redirect fields are managed by the SDK. */
    signInOptions?: Omit<SignInOptions, 'redirectUri' | 'postRedirectUri'>;
    /** The secret used to encrypt the session data stored in the cookie. */
    encryptionKey: string;
    /** The name of the cookie that stores the session data. Defaults to `logtoCookies`. */
    cookieKey?: string;
  };
