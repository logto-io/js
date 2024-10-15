import { conditional } from '@silverhand/essentials';
import { type OpenIdConfiguration } from 'angular-auth-oidc-client';

import { Prompt, QueryKey } from '../consts/index.js';
import { type SignInUriParameters } from '../index.js';

import { withReservedScopes } from './scopes.js';

/** The Logto configuration object for Angular apps. */
export type LogtoAngularConfig = {
  /**
   * The endpoint for the Logto server, you can get it from the integration guide
   * or the team settings page of the Logto Console.
   *
   * @example https://foo.logto.app
   */
  endpoint: string;
  /**
   * The client ID of your application, you can get it from the integration guide
   * or the application details page of the Logto Console.
   */
  appId: string;
  /**
   * The scopes (permissions) that your application needs to access.
   * Scopes that will be added by default: `openid`, `offline_access` and `profile`.
   */
  scopes?: string[];
  /**
   * The API resource that your application needs to access.
   *
   * @see {@link https://docs.logto.io/docs/recipes/rbac/ | RBAC} to learn more about how to use
   * role-based access control (RBAC) to protect API resources.
   */
  resource?: string;
  /**
   * @param redirectUri The redirect URI that the user will be redirected to after the sign-in flow
   * is completed.
   */
  redirectUri: string;
  /**
   * @param postLogoutRedirectUri The URI that the user will be redirected to after the sign-out
   * flow is completed.
   */
  postLogoutRedirectUri?: string;
  /**
   * The prompt parameter to be used for the authorization request.
   *
   * @default Prompt.Consent
   */
  prompt?: Prompt | Prompt[];
  /**
   * Whether to include reserved scopes (`openid`, `offline_access` and `profile`) in the scopes.
   *
   * @default true
   */
  includeReservedScopes?: boolean;
  /**
   * Login hint indicates the current user (usually an email address or a phone number).
   *
   * @link SignInUriParameters.loginHint
   */
  loginHint?: SignInUriParameters['loginHint'];
  /**
   * The first screen to be shown in the sign-in experience.
   *
   * @link SignInUriParameters.firstScreen
   */
  firstScreen?: SignInUriParameters['firstScreen'];
  /**
   * Identifiers used in the identifier sign-in, identifier register or reset password pages.
   *
   * Note: This parameter is applicable only when the `firstScreen` is set to either`identifierSignIn`
   * or `identifierRegister`.
   *
   * @link SignInUriParameters.identifiers
   */
  identifiers?: SignInUriParameters['identifiers'];
  /**
   * Direct sign-in options.
   *
   * @link SignInUriParameters.directSignIn
   */
  directSignIn?: SignInUriParameters['directSignIn'];
  /**
   * Extra parameters to be appended to the sign-in URI.
   *
   * Note: The parameters should be supported by the authorization server.
   *
   * @link SignInUriParameters.extraParams
   */
  extraParams?: SignInUriParameters['extraParams'];
};

/**
 * A helper function to build the OpenID Connect configuration for `angular-auth-oidc-client`
 * using a Logto-friendly way.
 *
 * @example
 * ```ts
 * // A minimal example
 * import { buildAngularAuthConfig } from '@logto/js';
 * import { provideAuth } from 'angular-auth-oidc-client';
 *
 * provideAuth({
 *   config: buildAngularAuthConfig({
 *     endpoint: '<your-logto-endpoint>',
 *     appId: '<your-app-id>',
 *     redirectUri: '<your-app-redirect-uri>',
 *   }),
 * });
 * ```
 *
 * @param logtoConfig The Logto configuration object for Angular apps.
 * @returns The OpenID Connect configuration for `angular-auth-oidc-client`.
 * @see {@link https://angular-auth-oidc-client.com/ | angular-auth-oidc-client} to learn more
 * about how to use the library.
 */
export const buildAngularAuthConfig = (logtoConfig: LogtoAngularConfig): OpenIdConfiguration => {
  const {
    endpoint,
    appId: clientId,
    scopes,
    resource,
    redirectUri: redirectUrl,
    postLogoutRedirectUri,
    prompt = Prompt.Consent,
    includeReservedScopes = true,
    loginHint,
    identifiers,
    firstScreen,
    directSignIn,
    extraParams,
  } = logtoConfig;
  const scope = includeReservedScopes ? withReservedScopes(scopes) : scopes?.join(' ');
  const customParameters = {
    ...conditional(resource && { [QueryKey.Resource]: resource }),
    ...conditional(loginHint && { [QueryKey.LoginHint]: loginHint }),
    ...conditional(firstScreen && { [QueryKey.FirstScreen]: firstScreen }),
    ...conditional(identifiers && { [QueryKey.Identifier]: identifiers.join(' ') }),
    ...conditional(
      directSignIn && { [QueryKey.DirectSignIn]: `${directSignIn.method}:${directSignIn.target}` }
    ),
    ...extraParams,
  };

  return {
    authority: new URL('/oidc', endpoint).href,
    redirectUrl,
    postLogoutRedirectUri,
    clientId,
    scope,
    responseType: 'code',
    autoUserInfo: !resource,
    renewUserInfoAfterTokenRenew: !resource,
    silentRenew: true,
    useRefreshToken: true,
    customParamsAuthRequest: {
      prompt: Array.isArray(prompt) ? prompt.join(' ') : prompt,
      ...customParameters,
    },
    customParamsCodeRequest: {
      ...customParameters,
    },
    customParamsRefreshTokenRequest: {
      ...customParameters,
    },
  };
};
