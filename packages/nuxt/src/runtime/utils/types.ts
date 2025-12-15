import type LogtoClient from '@logto/node';
import type { LogtoConfig, SignInOptions, IdTokenClaims, UserInfoResponse } from '@logto/node';

declare module 'h3' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- interface required for module augmentation
  interface H3EventContext {
    logtoUser: UserInfoResponse | IdTokenClaims | undefined;
    logtoClient: LogtoClient;
  }
}

type DeepPartial<T> = T extends Record<string, unknown>
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

type LogtoModuleOptions = {
  /**
   * The name to use when storing the Logto cookie.
   *
   * @see {@link CookieConfig.cookieKey} for the default value.
   */
  cookieName?: string;
  /**
   * Whether the Logto cookie should be secure.
   *
   * Set this to `true` if you are using https.
   *
   * @see {@link CookieConfig.isSecure}
   */
  cookieSecure?: boolean;
  /**
   * If Logto should fetch from the [userinfo endpoint](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)
   * in the server side for the `event.context.logtoUser` property (used by `useLogtoUser` composable).
   *
   * This is useful when you need to fetch additional claims like `custom_data`.
   */
  fetchUserInfo: boolean;
  /**
   * The URI to redirect to after a successful sign-in callback.
   *
   * This is NOT the redirect URI used in Logto's configuration. This is the URI that the user will be
   * redirected to after the sign-in callback is handled by the server.
   *
   * @default '/'
   */
  postCallbackRedirectUri: string;
  /**
   * The URI to redirect to after a successful sign-out.
   *
   * This is the post sign-out redirect URI used in Logto's configuration.
   *
   * @default '/'
   */
  postLogoutRedirectUri: string;
  /**
   * Pathnames for the sign-in, sign-out, and callback URIs. They will be handled by the Logto
   * event handler.
   */
  pathnames: {
    /**
     * The URI for initiating the sign-in process.
     *
     * @default '/sign-in'
     */
    signIn: string;
    /**
     * The URI for initiating the sign-out process.
     *
     * @default '/sign-out'
     */
    signOut: string;
    /**
     * The URI for handling the sign-in callback.
     *
     * @default '/callback'
     */
    callback: string;
  };
  /**
   * The options for the sign-in process.
   *
   * @see https://docs.logto.io/docs/references/openid-connect/authentication-parameters
   */
  signInOptions?: Omit<SignInOptions, 'redirectUri' | 'postRedirectUri'>;
};

/** The full runtime configuration for the Logto module. */
export type LogtoRuntimeConfig = LogtoModuleOptions & {
  /**
   * The secret used to encrypt the Logto cookie. It should be a random string.
   */
  cookieEncryptionKey: string;
  /**
   * Custom base URL for redirects
   *
   * This URL is used as the base for generating redirect and callback URLs.
   * It's particularly useful in environments where the application is behind
   * a proxy or where URLs are rewritten.
   *
   * If set, this value will be used instead of the automatically detected URL.
   * If not set, the system will use the URL obtained from `getRequestURL`.
   *
   * Example: 'https://your-public-facing-domain.com'
   *
   * Note: Provide only the base URL without paths or query parameters.
   */
  customRedirectBaseUrl: string;
} & Omit<LogtoConfig, 'appSecret'> &
  Required<Pick<LogtoConfig, 'appSecret'>>;

export type LogtoRuntimeConfigInput = DeepPartial<LogtoRuntimeConfig>;
