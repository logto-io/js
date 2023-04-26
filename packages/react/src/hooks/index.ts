import { type IdTokenClaims, type InteractionMode, type UserInfoResponse } from '@logto/browser';
import { useCallback, useContext, useEffect, useRef } from 'react';

import { LogtoContext, throwContextError } from '../context.js';

type Logto = {
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: Error;
  fetchUserInfo: () => Promise<UserInfoResponse | undefined>;
  getAccessToken: (resource?: string) => Promise<string | undefined>;
  getIdTokenClaims: () => Promise<IdTokenClaims | undefined>;
  signIn: (redirectUri: string, interactionMode?: InteractionMode) => Promise<void>;
  signOut: (postLogoutRedirectUri?: string) => Promise<void>;
};

const useLoadingState = () => {
  const { loadingCount, setLoadingCount } = useContext(LogtoContext);
  const isLoading = loadingCount > 0;

  const setLoadingState = useCallback(
    (state: boolean) => {
      if (state) {
        setLoadingCount((count) => count + 1);
      } else {
        setLoadingCount((count) => Math.max(0, count - 1));
      }
    },
    [setLoadingCount]
  );

  return { isLoading, setLoadingState };
};

const useErrorHandler = () => {
  const { setError } = useContext(LogtoContext);

  const handleError = useCallback(
    (error: unknown, fallbackErrorMessage?: string) => {
      if (error instanceof Error) {
        setError(error);
      } else if (fallbackErrorMessage) {
        setError(new Error(fallbackErrorMessage));
      }
      console.error(error);
    },
    [setError]
  );

  return { handleError };
};

const useHandleSignInCallback = (callback?: () => void) => {
  const { logtoClient, isAuthenticated, error, setIsAuthenticated } = useContext(LogtoContext);
  const { isLoading, setLoadingState } = useLoadingState();
  const { handleError } = useErrorHandler();
  const callbackRef = useRef<() => void>();

  useEffect(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    callbackRef.current = callback; // Update ref to the latest callback.
  }, [callback]);

  const handleSignInCallback = useCallback(
    async (callbackUri: string) => {
      if (!logtoClient) {
        return throwContextError();
      }

      try {
        setLoadingState(true);
        await logtoClient.handleSignInCallback(callbackUri);
        setIsAuthenticated(true);
        callbackRef.current?.();
      } catch (error: unknown) {
        handleError(error, 'Unexpected error occurred while handling sign in callback.');
      } finally {
        setLoadingState(false);
      }
    },
    [logtoClient, setLoadingState, setIsAuthenticated, handleError]
  );

  useEffect(() => {
    const currentPageUrl = window.location.href;

    if (!isAuthenticated && logtoClient?.isSignInRedirected(currentPageUrl) && !isLoading) {
      void handleSignInCallback(currentPageUrl);
    }
  }, [handleSignInCallback, isAuthenticated, isLoading, logtoClient]);

  return {
    isLoading,
    isAuthenticated,
    error,
  };
};

const useLogto = (): Logto => {
  const { logtoClient, loadingCount, isAuthenticated, error } = useContext(LogtoContext);
  const { setLoadingState } = useLoadingState();
  const { handleError } = useErrorHandler();

  const isLoading = loadingCount > 0;

  const signIn = useCallback(
    async (redirectUri: string, interactionMode?: InteractionMode) => {
      if (!logtoClient) {
        return throwContextError();
      }

      try {
        setLoadingState(true);

        await logtoClient.signIn(redirectUri, interactionMode);
      } catch (error: unknown) {
        handleError(error, 'Unexpected error occurred while signing in.');
      }
    },
    [logtoClient, setLoadingState, handleError]
  );

  const signOut = useCallback(
    async (postLogoutRedirectUri?: string) => {
      if (!logtoClient) {
        return throwContextError();
      }

      try {
        setLoadingState(true);

        await logtoClient.signOut(postLogoutRedirectUri);

        // We deliberately do NOT set isAuthenticated to false here, because the app state may change immediately
        // even before navigating to the oidc end session endpoint, which might cause rendering problems.
        // Moreover, since the location will be redirected, the isAuthenticated state will not matter any more.
      } catch (error: unknown) {
        handleError(error, 'Unexpected error occurred while signing out.');
      } finally {
        setLoadingState(false);
      }
    },
    [logtoClient, setLoadingState, handleError]
  );

  const fetchUserInfo = useCallback(async () => {
    if (!logtoClient) {
      return throwContextError();
    }

    try {
      setLoadingState(true);

      return await logtoClient.fetchUserInfo();
    } catch (error: unknown) {
      handleError(error, 'Unexpected error occurred while fetching user info.');
    } finally {
      setLoadingState(false);
    }
  }, [logtoClient, setLoadingState, handleError]);

  const getAccessToken = useCallback(
    async (resource?: string) => {
      if (!logtoClient) {
        return throwContextError();
      }

      try {
        setLoadingState(true);

        return await logtoClient.getAccessToken(resource);
      } catch (error: unknown) {
        handleError(error, 'Unexpected error occurred while getting access token.');
      } finally {
        setLoadingState(false);
      }
    },
    [logtoClient, setLoadingState, handleError]
  );

  const getIdTokenClaims = useCallback(async () => {
    if (!logtoClient) {
      return throwContextError();
    }

    try {
      return await logtoClient.getIdTokenClaims();
    } catch {
      // Do nothing if any exception occurs. Caller will get undefined value.
    }
  }, [logtoClient]);

  if (!logtoClient) {
    return throwContextError();
  }

  return {
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signOut,
    fetchUserInfo,
    getAccessToken,
    getIdTokenClaims,
  };
};

export { useLogto, useHandleSignInCallback };
