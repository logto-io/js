import type LogtoClient from '@logto/browser';
import { type Optional, trySafe } from '@silverhand/essentials';
import { Accessor, createEffect, useContext } from 'solid-js';

import { LogtoContext, throwContextError } from '../context';

type OptionalPromiseReturn<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => Promise<infer R>
    ? (...args: A) => Promise<Optional<R>>
    : T[K];
};

type Logto = {
  isAuthenticated: Accessor<boolean>;
  isLoading: Accessor<boolean>;
  error: Accessor<Error | undefined>;
} & OptionalPromiseReturn<
  Pick<
    LogtoClient,
    | 'getRefreshToken'
    | 'getAccessToken'
    | 'getAccessTokenClaims'
    | 'getOrganizationToken'
    | 'getOrganizationTokenClaims'
    | 'getIdToken'
    | 'getIdTokenClaims'
    | 'signOut'
    | 'fetchUserInfo'
    | 'clearAccessToken'
    | 'clearAllTokens'
  >
> &
  // Manually pick the method with overloads since TypeScript cannot infer the correct type.
  Pick<LogtoClient, 'signIn'>;

const useErrorHandler = () => {
  const {setError} = useContext(LogtoContext);

  function handleError(error: unknown, fallbackErrorMessage?: string) {
    if (error instanceof Error) {
      setError(error);
    } else if (fallbackErrorMessage) {
      setError(new Error(fallbackErrorMessage));
    }
    console.error(error);
  }

  return {handleError};
};

const useHandleSignInCallback = (callback?: () => void) => {
  const {logtoClient, isAuthenticated, error, setIsAuthenticated, isLoading, setLoading, setError} =
    useContext(LogtoContext);

  createEffect(() => {
    const client = logtoClient();
    if (!client || isLoading() || error()) {
      return;
    }

    (async () => {
      const currentPageUrl = window.location.href;
      const isRedirected = await client.isSignInRedirected(currentPageUrl);

      if (!isAuthenticated() && isRedirected) {
        setLoading(true);
        await trySafe(
          async () => {
            await client.handleSignInCallback(currentPageUrl);
            setIsAuthenticated(true);
            callback?.();
          },
          (error) => {
            setError(error, 'Unexpected error occurred while handling sign in callback.');
          }
        );
        setLoading(false);
      }
    })();
  })

  return {
    isLoading,
    isAuthenticated,
    error,
  };
};

const useLogto = (): Logto => {
  const {logtoClient, isAuthenticated, error, isLoading, setLoading, setError} = useContext(LogtoContext);

  const client = logtoClient() ?? throwContextError();

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

  return {
    isAuthenticated,
    isLoading,
    error,
    getRefreshToken: proxy(client.getRefreshToken.bind(client)),
    getAccessToken: proxy(client.getAccessToken.bind(client)),
    getAccessTokenClaims: proxy(client.getAccessTokenClaims.bind(client)),
    getOrganizationToken: proxy(client.getOrganizationToken.bind(client)),
    getOrganizationTokenClaims: proxy(client.getOrganizationTokenClaims.bind(client)),
    getIdToken: proxy(client.getIdToken.bind(client)),
    getIdTokenClaims: proxy(client.getIdTokenClaims.bind(client)),
    // eslint-disable-next-line no-restricted-syntax -- TypeScript cannot infer the correct type.
    signIn: proxy(client.signIn.bind(client), false) as LogtoClient['signIn'],
    // We deliberately do NOT set isAuthenticated to false in the function below, because the app state
    // may change immediately even before navigating to the oidc end session endpoint, which might cause
    // rendering problems.
    // Moreover, since the location will be redirected, the isAuthenticated state will not matter any more.
    signOut: proxy(client.signOut.bind(client)),
    fetchUserInfo: proxy(client.fetchUserInfo.bind(client)),
    clearAccessToken: proxy(client.clearAccessToken.bind(client)),
    clearAllTokens: proxy(client.clearAllTokens.bind(client)),
  };
};

export { useLogto, useHandleSignInCallback };
