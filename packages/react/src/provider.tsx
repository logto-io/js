import LogtoClient, { ConfigParameters } from '@logto/client';
import React, { useCallback, useEffect, useReducer, useState } from 'react';

import { initialAuthState } from './auth-state';
import { LogtoContext } from './context';
import { reducer } from './reducer';

export interface LogtoProviderProperties {
  logtoConfig: ConfigParameters;
  children?: React.ReactNode;
}

export const LogtoProvider = ({ logtoConfig, children }: LogtoProviderProperties) => {
  const [logtoClient, setLogtoClient] = useState<LogtoClient>();
  const [state, dispatch] = useReducer(reducer, initialAuthState);

  useEffect(() => {
    const createClient = async () => {
      const client = await LogtoClient.create(logtoConfig);
      dispatch({ type: 'INITIALIZE', isAuthenticated: client.isAuthenticated() });
      setLogtoClient(client);
    };

    void createClient();
  }, [logtoConfig]);

  const loginWithRedirect = useCallback(
    async (redirectUri: string) => {
      if (!logtoClient) {
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
        return;
      }

      dispatch({ type: 'LOGOUT' });
      logtoClient.logout(redirectUri);
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
