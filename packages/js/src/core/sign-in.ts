import { Prompt, QueryKey } from '../consts/index.js';
import type { FirstScreen, InteractionMode } from '../types/index.js';
import { withReservedScopes } from '../utils/scopes.js';

const codeChallengeMethod = 'S256';
const responseType = 'code';

export type DirectSignInOptions = {
  /**
   * The method to be used for the direct sign-in.
   */
  method: 'social' | 'sso';
  /**
   * The target to be used for the direct sign-in.
   *
   * - For `method: 'social'`, it should be the social connector target.
   */
  target: string;
};

type Identifier = 'email' | 'phone' | 'username';

export type SignInUriParameters = {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
  scopes?: string[];
  resources?: string[];
  prompt?: Prompt | Prompt[];
  /**
   * The first screen to be shown in the sign-in experience.
   */
  firstScreen?: FirstScreen;
  /**
   * Specifies identifiers used in the identifier sign-in or identifier register page.
   *
   * Available values: `email`, `phone`, `username`.
   *
   * This parameter is applicable only when the `firstScreen` is set to either `identifierSignIn` or `identifierRegister`.
   *
   * If the provided identifier is not supported in the Logto sign-in experience configuration, it will be ignored,
   * and if no one of them is supported, it will fallback to the sign-in / sign-up method value set in the sign-in experience configuration.
   *
   */
  identifiers?: Identifier[];
  /**
   * The first screen to be shown in the sign-in experience.
   *
   * @deprecated Use `firstScreen` instead.
   */
  interactionMode?: InteractionMode;
  /**
   * Login hint indicates the current user (usually an email address or a phone number).
   *
   * @experimental Don't use this field as it's under development.
   */
  loginHint?: string;
  /**
   * Parameters for direct sign-in.
   *
   * @see {@link https://docs.logto.io/docs/references/openid-connect/authentication-parameters/#direct-sign-in Direct sign-in} for more information.
   */
  directSignIn?: DirectSignInOptions;
  /**
   * Extra parameters for the authentication request. Note that the parameters should be supported
   * by the authorization server.
   */
  extraParams?: Record<string, string>;
  /**
   * Whether to include reserved scopes (`openid`, `offline_access` and `profile`) in the scopes.
   *
   * @default true
   */
  includeReservedScopes?: boolean;
};

const buildPrompt = (prompt?: Prompt | Prompt[]) => {
  if (Array.isArray(prompt)) {
    return prompt.join(' ');
  }

  return prompt ?? Prompt.Consent;
};

// eslint-disable-next-line complexity
export const generateSignInUri = ({
  authorizationEndpoint,
  clientId,
  redirectUri,
  codeChallenge,
  state,
  scopes,
  resources,
  prompt,
  firstScreen,
  identifiers: identifier,
  interactionMode,
  loginHint,
  directSignIn,
  extraParams,
  includeReservedScopes = true,
}: SignInUriParameters) => {
  const urlSearchParameters = new URLSearchParams({
    [QueryKey.ClientId]: clientId,
    [QueryKey.RedirectUri]: redirectUri,
    [QueryKey.CodeChallenge]: codeChallenge,
    [QueryKey.CodeChallengeMethod]: codeChallengeMethod,
    [QueryKey.State]: state,
    [QueryKey.ResponseType]: responseType,
    [QueryKey.Prompt]: buildPrompt(prompt),
  });

  const computedScopes = includeReservedScopes ? withReservedScopes(scopes) : scopes?.join(' ');

  if (computedScopes) {
    urlSearchParameters.append(QueryKey.Scope, computedScopes);
  }

  if (loginHint) {
    urlSearchParameters.append(QueryKey.LoginHint, loginHint);
  }

  if (directSignIn) {
    urlSearchParameters.append(
      QueryKey.DirectSignIn,
      `${directSignIn.method}:${directSignIn.target}`
    );
  }

  for (const resource of resources ?? []) {
    urlSearchParameters.append(QueryKey.Resource, resource);
  }

  if (firstScreen) {
    urlSearchParameters.append(QueryKey.FirstScreen, firstScreen);
  }
  // @deprecated Remove later
  else if (interactionMode) {
    urlSearchParameters.append(QueryKey.InteractionMode, interactionMode);
  }

  if (identifier && identifier.length > 0) {
    urlSearchParameters.append(QueryKey.Identifier, identifier.join(' '));
  }

  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      urlSearchParameters.append(key, value);
    }
  }

  return `${authorizationEndpoint}?${urlSearchParameters.toString()}`;
};
