import type LogtoClient from '@logto/browser';
import { createContext } from 'react';

export type LogtoContextProps = {
  logtoClient?: LogtoClient;
  isAuthenticated: boolean;
  loadingCount: number;
  error?: Error;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingCount: React.Dispatch<React.SetStateAction<number>>;
  setError: React.Dispatch<React.SetStateAction<Error | undefined>>;
};

export const throwContextError = (): never => {
  throw new Error('Must be used inside <LogtoProvider> context.');
};

export const LogtoContext = createContext<LogtoContextProps>({
  logtoClient: undefined,
  isAuthenticated: false,
  loadingCount: 0,
  error: undefined,
  setIsAuthenticated: throwContextError,
  setLoadingCount: throwContextError,
  setError: throwContextError,
});
