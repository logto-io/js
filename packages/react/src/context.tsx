import LogtoClient from '@logto/client';
import { createContext } from 'react';

import { AuthState, initialAuthState } from './auth-state';

const notInProvider = (): never => {
  throw new Error('Must be used inside <LogtoProvider>');
};

export interface LogtoContextProperties extends AuthState {
  logtoClient?: LogtoClient;
  loginWithRedirect: (redirectUri: string) => Promise<void>;
  handleCallback: (url: string) => Promise<void>;
  logout: (redirectUri: string) => void;
}

export const LogtoContext = createContext<LogtoContextProperties>({
  ...initialAuthState,
  loginWithRedirect: notInProvider,
  handleCallback: notInProvider,
  logout: notInProvider,
});
