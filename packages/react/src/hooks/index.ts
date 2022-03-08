import { IdTokenClaims, UserInfoResponse } from '@logto/browser';
import { Nullable } from '@silverhand/essentials';
import { useCallback, useContext, useEffect, useState } from 'react';

import { LogtoContext } from '../context';

type Logto = {
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchUserInfo: () => Promise<UserInfoResponse>;
  getAccessToken: (resource?: string) => Promise<Nullable<string>>;
  getIdTokenClaims: () => IdTokenClaims;
  handleSignInCallback: (callbackUri: string) => Promise<void>;
  signIn: (redirectUri: string) => Promise<void>;
  signOut: (postLogoutRedirectUri: string) => Promise<void>;
};

const notInProviderErrorMessage = 'useLogto hook must be used inside LogtoProvider context';

export default function useLogto(): Logto {
  const { logtoClient, loadingCount, setLoadingCount } = useContext(LogtoContext);
  const [isAuthenticated, setIsAuthenticated] = useState(logtoClient?.isAuthenticated ?? false);
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

  const signIn = useCallback(
    async (redirectUri: string) => {
      if (!logtoClient) {
        throw new Error(notInProviderErrorMessage);
      }

      setLoadingState(true);
      await logtoClient.signIn(redirectUri);
      setLoadingState(false);
    },
    [logtoClient, setLoadingState]
  );

  const handleSignInCallback = useCallback(
    async (callbackUri: string) => {
      if (!logtoClient) {
        throw new Error(notInProviderErrorMessage);
      }
      setLoadingState(true);
      await logtoClient.handleSignInCallback(callbackUri);
      setLoadingState(false);
      setIsAuthenticated(true);
    },
    [logtoClient, setLoadingState]
  );

  const signOut = useCallback(
    async (postLogoutRedirectUri: string) => {
      if (!logtoClient) {
        throw new Error(notInProviderErrorMessage);
      }
      setLoadingState(true);
      await logtoClient.signOut(postLogoutRedirectUri);
      setLoadingState(false);
      setIsAuthenticated(false);
    },
    [logtoClient, setLoadingState]
  );

  const fetchUserInfo = useCallback(async () => {
    if (!logtoClient) {
      throw new Error(notInProviderErrorMessage);
    }
    setLoadingState(true);
    const userInfo = await logtoClient.fetchUserInfo();
    setLoadingState(false);

    return userInfo;
  }, [logtoClient, setLoadingState]);

  const getAccessToken = useCallback(async () => {
    if (!logtoClient) {
      throw new Error(notInProviderErrorMessage);
    }
    setLoadingState(true);
    const accessToken = await logtoClient.getAccessToken();
    setLoadingState(false);

    return accessToken;
  }, [logtoClient, setLoadingState]);

  const getIdTokenClaims = useCallback(() => {
    if (!logtoClient) {
      throw new Error(notInProviderErrorMessage);
    }

    return logtoClient.getIdTokenClaims();
  }, [logtoClient]);

  useEffect(() => {
    if (!isAuthenticated && logtoClient?.isSignInRedirected(window.location.href)) {
      void handleSignInCallback(window.location.href);
    }
  }, [handleSignInCallback, isAuthenticated, logtoClient]);

  if (!logtoClient) {
    throw new Error(notInProviderErrorMessage);
  }

  return {
    isAuthenticated,
    isLoading,
    signIn,
    handleSignInCallback,
    signOut,
    fetchUserInfo,
    getAccessToken,
    getIdTokenClaims,
  };
}
