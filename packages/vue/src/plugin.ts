import { type Optional } from '@silverhand/essentials';

import type { Context } from './context.js';
import { throwContextError } from './context.js';

export const createPluginMethods = (context: Context) => {
  const { logtoClient, setLoading, setError, setIsAuthenticated } = context;

  const client = logtoClient.value ?? throwContextError();

  const proxy = <R, T extends unknown[]>(
    run: (...args: T) => Promise<R>,
    resetLoadingState = true
  ) => {
    return async (...args: T): Promise<Optional<R>> => {
      try {
        setLoading(true);
        return await run(...args);
      } catch (error: unknown) {
        setError(error, `Unexpected error occurred while calling ${run.name}.`);
      } finally {
        if (resetLoadingState) {
          setLoading(false);
        }
      }
    };
  };

  const methods = {
    getRefreshToken: proxy(client.getRefreshToken.bind(client)),
    getAccessToken: proxy(client.getAccessToken.bind(client)),
    getAccessTokenClaims: proxy(client.getAccessTokenClaims.bind(client)),
    getOrganizationToken: proxy(client.getOrganizationToken.bind(client)),
    getOrganizationTokenClaims: proxy(client.getOrganizationTokenClaims.bind(client)),
    getIdToken: proxy(client.getIdToken.bind(client)),
    getIdTokenClaims: proxy(client.getIdTokenClaims.bind(client)),
    signIn: proxy(client.signIn.bind(client), false),
    // We deliberately do NOT set isAuthenticated to false in the function below, because the app state
    // may change immediately even before navigating to the oidc end session endpoint, which might cause
    // rendering problems.
    // Moreover, since the location will be redirected, the isAuthenticated state will not matter any more.
    signOut: proxy(client.signOut.bind(client)),
    fetchUserInfo: proxy(client.fetchUserInfo.bind(client)),
  };

  const handleSignInCallback = async (callbackUri: string, callbackFunction?: () => void) => {
    if (!logtoClient.value) {
      return throwContextError();
    }

    try {
      setLoading(true);
      await logtoClient.value.handleSignInCallback(callbackUri);
      setIsAuthenticated(true);
      callbackFunction?.();
    } catch (error: unknown) {
      setError(error, 'Unexpected error occurred while handling sign in callback.');
    } finally {
      setLoading(false);
    }
  };

  return {
    ...methods,
    handleSignInCallback,
  };
};
