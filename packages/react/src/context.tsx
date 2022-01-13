import LogtoClient from '@logto/browser';
import { createContext } from 'react';

import { AuthState, defaultAuthState } from './auth-state';

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
  ...defaultAuthState,
  loginWithRedirect: notInProvider,
  handleCallback: notInProvider,
  logout: notInProvider,
});
