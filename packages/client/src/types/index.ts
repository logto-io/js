import {
  Prompt,
  ReservedResource,
  UserScope,
  isArbitraryObject,
  withReservedScopes,
} from '@logto/js';
import { deduplicate } from '@silverhand/essentials';

/** The configuration object for the Logto client. */
export type LogtoConfig = {
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
   * The client secret of your application, you can get it from the application
   * details page of the Logto Console.
   */
  appSecret?: string;
  /**
   * The scopes (permissions) that your application needs to access.
   * Scopes that will be added by default: `openid`, `offline_access` and `profile`.
   *
   * If resources are specified, scopes will be applied to every resource.
   *
   * @see {@link https://docs.logto.io/docs/recipes/integrate-logto/vanilla-js/#fetch-user-information | Fetch user information}
   * for more information of available scopes for user information.
   */
  scopes?: string[];
  /**
   * The API resources that your application needs to access. You can specify
   * multiple resources by providing an array of strings.
   *
   * @see {@link https://docs.logto.io/docs/recipes/rbac/ | RBAC} to learn more about how to use role-based access control (RBAC) to protect API resources.
   */
  resources?: string[];
  /**
   * The prompt parameter to be used for the authorization request.
   */
  prompt?: Prompt | Prompt[];
  /**
   * Whether to include reserved scopes (`openid`, `offline_access` and `profile`) in the scopes.
   *
   * @default true
   */
  includeReservedScopes?: boolean;
};

/**
 * Normalize the Logto client configuration per the following rules:
 *
 * - Add default scopes (`openid`, `offline_access` and `profile`) if not provided and
 * `includeReservedScopes` is `true`.
 * - Add {@link ReservedResource.Organization} to resources if {@link UserScope.Organizations} is
 * included in scopes.
 *
 * @param config The Logto client configuration to be normalized.
 * @returns The normalized Logto client configuration.
 */
export const normalizeLogtoConfig = (config: LogtoConfig): LogtoConfig => {
  const { prompt = Prompt.Consent, scopes = [], resources, ...rest } = config;
  const includeReservedScopes = config.includeReservedScopes ?? true;

  return {
    ...rest,
    prompt,
    scopes: includeReservedScopes ? withReservedScopes(scopes).split(' ') : scopes,
    resources: scopes.includes(UserScope.Organizations)
      ? deduplicate([...(resources ?? []), ReservedResource.Organization])
      : resources,
  };
};

export type AccessToken = {
  /** The access token string. */
  token: string;
  /** The scopes that the access token is granted for. */
  scope: string;
  /** The timestamp of the access token expiration. */
  expiresAt: number;
};

export const isLogtoSignInSessionItem = (data: unknown): data is LogtoSignInSessionItem => {
  if (!isArbitraryObject(data)) {
    return false;
  }

  return ['redirectUri', 'codeVerifier', 'state'].every((key) => typeof data[key] === 'string');
};

export const isLogtoAccessTokenMap = (data: unknown): data is Record<string, AccessToken> => {
  if (!isArbitraryObject(data)) {
    return false;
  }

  return Object.values(data).every((value) => {
    if (!isArbitraryObject(value)) {
      return false;
    }

    return (
      typeof value.token === 'string' &&
      typeof value.scope === 'string' &&
      typeof value.expiresAt === 'number'
    );
  });
};

export type LogtoSignInSessionItem = {
  redirectUri: string;
  postRedirectUri?: string;
  codeVerifier: string;
  state: string;
};
