import { IdTokenClaims, UserInfoResponse } from '@logto/browser';
import { useCallback, useContext, useEffect } from 'react';

import { LogtoContext, throwContextError } from '../context';

type Logto = {
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: Error;
  fetchUserInfo: () => Promise<UserInfoResponse | undefined>;
  getAccessToken: (resource?: string) => Promise<string | undefined>;
  getIdTokenClaims: () => IdTokenClaims | undefined;
  signIn: (redirectUri: string) => Promise<void>;
  signOut: (postLogoutRedirectUri: string) => Promise<void>;
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

const useHandleSignInCallback = (returnToPageUrl = window.location.origin) => {
  const { logtoClient, isAuthenticated, error, setIsAuthenticated } = useContext(LogtoContext);
  const { isLoading, setLoadingState } = useLoadingState();
  const { handleError } = useErrorHandler();

  const handleSignInCallback = useCallback(
    async (callbackUri: string) => {
      if (!logtoClient) {
        return throwContextError();
      }

      try {
        setLoadingState(true);

        await logtoClient.handleSignInCallback(callbackUri);
        setIsAuthenticated(true);
        window.location.assign(returnToPageUrl);
      } catch (error: unknown) {
        handleError(error, 'Unexpected error occurred while handling sign in callback.');
      } finally {
        setLoadingState(false);
      }
    },
    [logtoClient, returnToPageUrl, setIsAuthenticated, setLoadingState, handleError]
  );

  useEffect(() => {
    if (!isAuthenticated && logtoClient?.isSignInRedirected(window.location.href)) {
      void handleSignInCallback(window.location.href);
    }
  }, [handleSignInCallback, isAuthenticated, logtoClient]);

  return {
    isLoading,
    isAuthenticated,
    error,
  };
};

const useLogto = (): Logto => {
  const { logtoClient, loadingCount, isAuthenticated, error, setIsAuthenticated } =
    useContext(LogtoContext);
  const { setLoadingState } = useLoadingState();
  const { handleError } = useErrorHandler();

  const isLoading = loadingCount > 0;

  const signIn = useCallback(
    async (redirectUri: string) => {
      if (!logtoClient) {
        return throwContextError();
      }

      try {
        setLoadingState(true);

        await logtoClient.signIn(redirectUri);
      } catch (error: unknown) {
        handleError(error, 'Unexpected error occurred while signing in.');
      } finally {
        setLoadingState(false);
      }
    },
    [logtoClient, setLoadingState, handleError]
  );

  const signOut = useCallback(
    async (postLogoutRedirectUri: string) => {
      if (!logtoClient) {
        return throwContextError();
      }

      try {
        setLoadingState(true);

        await logtoClient.signOut(postLogoutRedirectUri);
        setIsAuthenticated(false);
      } catch (error: unknown) {
        handleError(error, 'Unexpected error occurred while signing out.');
      } finally {
        setLoadingState(false);
      }
    },
    [logtoClient, setIsAuthenticated, setLoadingState, handleError]
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

  const getIdTokenClaims = useCallback(() => {
    if (!logtoClient) {
      return throwContextError();
    }

    try {
      return logtoClient.getIdTokenClaims();
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
