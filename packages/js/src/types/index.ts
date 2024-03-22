export type LogtoRequestErrorBody = {
  code: string;
  message: string;
};

/**
 * A request function that accepts a `fetch`-like function parameters and returns
 * a promise with the parsed response body.
 */
export type Requester = <T>(...args: Parameters<typeof fetch>) => Promise<T>;

// Need to align with the OIDC extraParams settings in core
/**
 * The interaction mode to be used for the authorization request. Note it's not
 * a part of the OIDC standard, but a Logto-specific extension.
 *
 * - `signIn`: The authorization request will be initiated with a sign-in page.
 * - `signUp`: The authorization request will be initiated with a sign-up page.
 */
export type InteractionMode = 'signIn' | 'signUp';

/**
 * The first screen to be shown in the sign-in experience. Note it's not a part of the OIDC
 * standard, but a Logto-specific extension.
 *
 * @experimental Don't use this type as it's under development.
 */
export type FirstScreen = 'signIn' | 'register';
