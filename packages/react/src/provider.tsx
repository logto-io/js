import LogtoClient, { ConfigParameters } from '@logto/client';
import React, { useCallback, useEffect, useReducer, useState } from 'react';

import { defaultAuthState } from './auth-state';
import { LogtoContext } from './context';
import { reducer } from './reducer';

export interface LogtoProviderProperties {
  logtoConfig: ConfigParameters;
  children?: React.ReactNode;
}

export const LogtoProvider = ({ logtoConfig, children }: LogtoProviderProperties) => {
  const [logtoClient, setLogtoClient] = useState<LogtoClient>();
  const [state, dispatch] = useReducer(reducer, defaultAuthState);

  useEffect(() => {
    const createClient = async () => {
      try {
        const client = await LogtoClient.create(logtoConfig);
        setLogtoClient(client);
        const isLoginRedirect = client.isLoginRedirect(window.location.href);
        // If is login redirect, should set isLoading and isInitialized at the same time
        dispatch({
          type: 'INITIALIZE',
          isAuthenticated: client.isAuthenticated(),
          isLoading: isLoginRedirect,
        });
      } catch (error: unknown) {
        dispatch({ type: 'ERROR', error });
      }
    };

    void createClient();
  }, [logtoConfig]);

  useEffect(() => {
    if (logtoClient?.isLoginRedirect(window.location.href)) {
      void handleCallback(window.location.href);
    }
  }, [logtoClient]);

  const loginWithRedirect = useCallback(
    async (redirectUri: string) => {
      if (!logtoClient) {
        dispatch({ type: 'ERROR', error: new Error('Should init first') });
        return;
      }

      dispatch({ type: 'LOGIN_WITH_REDIRECT' });
      try {
        await logtoClient.loginWithRedirect(redirectUri);
      } catch (error: unknown) {
        dispatch({ type: 'ERROR', error });
      }
    },
    [logtoClient]
  );

  const handleCallback = useCallback(
    async (uri: string) => {
      if (!logtoClient) {
        dispatch({ type: 'ERROR', error: new Error('Should init first') });
        return;
      }

      dispatch({ type: 'HANDLE_CALLBACK_REQUEST' });
      try {
        await logtoClient.handleCallback(uri);
        dispatch({ type: 'HANDLE_CALLBACK_SUCCESS' });
      } catch (error: unknown) {
        dispatch({ type: 'ERROR', error });
      }
    },
    [logtoClient]
  );

  const logout = useCallback(
    (redirectUri: string) => {
      if (!logtoClient) {
        dispatch({ type: 'ERROR', error: new Error('Should init first') });
        return;
      }

      logtoClient.logout(redirectUri);
      dispatch({ type: 'LOGOUT' });
    },
    [logtoClient]
  );

  return (
    <LogtoContext.Provider
      value={{ ...state, logtoClient, loginWithRedirect, handleCallback, logout }}
    >
      {children}
    </LogtoContext.Provider>
  );
};
