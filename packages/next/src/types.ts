import type { GetContextParameters, LogtoConfig, SessionWrapper, SignInOptions } from '@logto/node';
import type NodeClient from '@logto/node';
import { type NextApiRequest, type NextApiResponse } from 'next';

export type LogtoNextConfig = LogtoConfig & {
  cookieSecure: boolean;
  baseUrl: string;
  /**
   * Can be provided to use custom session wrapper,
   * for example, to use external storage solutions,
   * you can save the session data in external storage and return a key in the sessionWrapper.wrap method,
   * then use the key to get the session data from external storage in the sessionWrapper.unwrap method.
   */
  sessionWrapper?: SessionWrapper;
  cookieSecret?: string;
};

export type Adapters = {
  NodeClient: typeof NodeClient;
};

export type ErrorHandler = (
  request: NextApiRequest,
  response: NextApiResponse,
  error: unknown
) => unknown;

export type AuthRouteSignInOptions = Omit<
  SignInOptions,
  'redirectUri' | 'postRedirectUri' | 'interactionMode'
>;

export type AuthRouteFlow = 'signIn' | 'signUp';

export type GetSignInOptions = (
  request: NextApiRequest,
  flow: AuthRouteFlow
) => AuthRouteSignInOptions | Promise<AuthRouteSignInOptions>;

export type HandleAuthRoutesOptions = {
  getContext?: GetContextParameters;
  onError?: ErrorHandler;
  /** Default options for sign-in and sign-up. Redirect fields are managed by the SDK. */
  signInOptions?: AuthRouteSignInOptions;
  /** Returns request-specific options that override `signInOptions`. */
  getSignInOptions?: GetSignInOptions;
};
