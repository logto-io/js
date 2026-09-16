import type { GetContextParameters, SignInOptions } from '@logto/node';
import type { NextApiHandler } from 'next';

import type { ErrorHandler, HandleAuthRoutesOptions } from './types.js';

type AuthRouteHandlers = Readonly<{
  handleSignIn: (options: SignInOptions & { onError?: ErrorHandler }) => NextApiHandler;
  handleSignInCallback: (redirectTo?: string, onError?: ErrorHandler) => NextApiHandler;
  handleSignOut: (redirectUri?: string, onError?: ErrorHandler) => NextApiHandler;
  handleUser: (configs?: GetContextParameters, onError?: ErrorHandler) => NextApiHandler;
}>;

const isHandleAuthRoutesOptions = (
  value: GetContextParameters | HandleAuthRoutesOptions
): value is HandleAuthRoutesOptions =>
  'getContext' in value ||
  'onError' in value ||
  'signInOptions' in value ||
  'resolveSignInOptions' in value;

export const createAuthRoutesHandler = (
  baseUrl: string,
  handlers: AuthRouteHandlers,
  optionsOrConfigs: GetContextParameters | HandleAuthRoutesOptions = {},
  legacyOnError?: ErrorHandler
): NextApiHandler => {
  const options: HandleAuthRoutesOptions = isHandleAuthRoutesOptions(optionsOrConfigs)
    ? optionsOrConfigs
    : {
        getContext: optionsOrConfigs,
        ...(legacyOnError && { onError: legacyOnError }),
      };
  const { getContext, onError, signInOptions, resolveSignInOptions } = options;

  return async (request, response) => {
    const { action } = request.query;

    if (action === 'sign-in' || action === 'sign-up') {
      const flow = action === 'sign-in' ? 'signIn' : 'signUp';
      const requestSignInOptions = await resolveSignInOptions?.(request, flow);

      return handlers.handleSignIn({
        ...signInOptions,
        ...requestSignInOptions,
        redirectUri: `${baseUrl}/api/logto/sign-in-callback`,
        ...(flow === 'signUp' && { firstScreen: 'register' }),
        ...(onError && { onError }),
      })(request, response);
    }

    if (action === 'sign-in-callback') {
      return handlers.handleSignInCallback(undefined, onError)(request, response);
    }

    if (action === 'sign-out') {
      return handlers.handleSignOut(undefined, onError)(request, response);
    }

    if (action === 'user') {
      return handlers.handleUser(getContext, onError)(request, response);
    }

    response.status(404).end();
  };
};
