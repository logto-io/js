import { IdTokenClaims, UserInfoResponse } from '@logto/browser';
import { Nullable } from '@silverhand/essentials';
import { useCallback, useContext, useEffect } from 'react';

import { LogtoContext, throwContextError } from '../context';

type Logto = {
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchUserInfo: () => Promise<UserInfoResponse>;
  getAccessToken: (resource?: string) => Promise<Nullable<string>>;
  getIdTokenClaims: () => IdTokenClaims;
  signIn: (redirectUri: string) => Promise<void>;
  signOut: (postLogoutRedirectUri: string) => Promise<void>;
};

const useLoadingState = (): ((state: boolean) => void) => {
  const { setLoadingCount } = useContext(LogtoContext);

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

  return setLoadingState;
};

const useHandleSignInCallback = (): void => {
  const { logtoClient, isAuthenticated, setIsAuthenticated } = useContext(LogtoContext);
  const setLoadingState = useLoadingState();

  const handleSignInCallback = useCallback(
    async (callbackUri: string) => {
      if (!logtoClient) {
        return throwContextError();
      }
      setLoadingState(true);
      await logtoClient.handleSignInCallback(callbackUri);
      setLoadingState(false);
      setIsAuthenticated(true);
    },
    [logtoClient, setIsAuthenticated, setLoadingState]
  );

  useEffect(() => {
    if (!isAuthenticated && logtoClient?.isSignInRedirected(window.location.href)) {
      void handleSignInCallback(window.location.href);
    }
  }, [handleSignInCallback, isAuthenticated, logtoClient]);
};

const useLogto = (): Logto => {
  const { logtoClient, loadingCount, isAuthenticated, setIsAuthenticated } =
    useContext(LogtoContext);
  const setLoadingState = useLoadingState();
  const isLoading = loadingCount > 0;

  const signIn = useCallback(
    async (redirectUri: string) => {
      if (!logtoClient) {
        return throwContextError();
      }

      setLoadingState(true);
      await logtoClient.signIn(redirectUri);
      setLoadingState(false);
    },
    [logtoClient, setLoadingState]
  );

  const signOut = useCallback(
    async (postLogoutRedirectUri: string) => {
      if (!logtoClient) {
        return throwContextError();
      }
      setLoadingState(true);
      await logtoClient.signOut(postLogoutRedirectUri);
      setLoadingState(false);
      setIsAuthenticated(false);
    },
    [logtoClient, setIsAuthenticated, setLoadingState]
  );

  const fetchUserInfo = useCallback(async () => {
    if (!logtoClient) {
      return throwContextError();
    }
    setLoadingState(true);
    const userInfo = await logtoClient.fetchUserInfo();
    setLoadingState(false);

    return userInfo;
  }, [logtoClient, setLoadingState]);

  const getAccessToken = useCallback(
    async (resource?: string) => {
      if (!logtoClient) {
        return throwContextError();
      }
      setLoadingState(true);
      const accessToken = await logtoClient.getAccessToken(resource);
      setLoadingState(false);

      return accessToken;
    },
    [logtoClient, setLoadingState]
  );

  const getIdTokenClaims = useCallback(() => {
    if (!logtoClient) {
      return throwContextError();
    }

    return logtoClient.getIdTokenClaims();
  }, [logtoClient]);

  if (!logtoClient) {
    return throwContextError();
  }

  return {
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    fetchUserInfo,
    getAccessToken,
    getIdTokenClaims,
  };
};

export { useLogto, useHandleSignInCallback };
