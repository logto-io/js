import type LogtoClient from '@logto/browser';
import { createContext } from 'react';

export type LogtoContextProps = {
  logtoClient?: LogtoClient;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: Error;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoading: (state: boolean) => void;
  setError: React.Dispatch<React.SetStateAction<Error | undefined>>;
};

export const throwContextError = (): never => {
  throw new Error('Must be used inside <LogtoProvider> context.');
};

export const LogtoContext = createContext<LogtoContextProps>({
  logtoClient: undefined,
  isAuthenticated: false,
  isLoading: false,
  error: undefined,
  setIsAuthenticated: throwContextError,
  setIsLoading: throwContextError,
  setError: throwContextError,
});
