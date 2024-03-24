import { Prompt, QueryKey } from '../consts/index.js';
import type { FirstScreen, InteractionMode } from '../types/index.js';
import { withDefaultScopes } from '../utils/scopes.js';

const codeChallengeMethod = 'S256';
const responseType = 'code';

/** @experimental Don't use this type as it's under development. */
export type DirectSignInOptions = {
  /**
   * The method to be used for the direct sign-in.
   */
  method: 'social';
  /**
   * The target to be used for the direct sign-in.
   *
   * - For `method: 'social'`, it should be the social connector target.
   */
  target: string;
};

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
   *
   * @experimental Don't use this field as it's under development.
   */
  firstScreen?: FirstScreen;
  /** The first screen to be shown in the sign-in experience. */
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
   * @experimental Don't use this field as it's under development.
   */
  directSignIn?: DirectSignInOptions;
  /**
   * Extra parameters for the authentication request. Note that the parameters should be supported
   * by the authorization server.
   */
  extraParams?: Record<string, string>;
};

const buildPrompt = (prompt?: Prompt | Prompt[]) => {
  if (Array.isArray(prompt)) {
    return prompt.join(' ');
  }

  return prompt ?? Prompt.Consent;
};

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
  interactionMode,
  loginHint,
  directSignIn,
  extraParams,
}: SignInUriParameters) => {
  const urlSearchParameters = new URLSearchParams({
    [QueryKey.ClientId]: clientId,
    [QueryKey.RedirectUri]: redirectUri,
    [QueryKey.CodeChallenge]: codeChallenge,
    [QueryKey.CodeChallengeMethod]: codeChallengeMethod,
    [QueryKey.State]: state,
    [QueryKey.ResponseType]: responseType,
    [QueryKey.Prompt]: buildPrompt(prompt),
    [QueryKey.Scope]: withDefaultScopes(scopes),
    ...extraParams,
  });

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

  return `${authorizationEndpoint}?${urlSearchParameters.toString()}`;
};
