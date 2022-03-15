import LogtoClient from '@logto/browser';
import { createContext } from 'react';

export type LogtoContextProps = {
  logtoClient?: LogtoClient;
  isAuthenticated: boolean;
  loadingCount: number;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingCount: React.Dispatch<React.SetStateAction<number>>;
};

export const throwContextError = (): never => {
  throw new Error('Must be used inside <LogtoProvider> context.');
};

export const LogtoContext = createContext<LogtoContextProps>({
  logtoClient: undefined,
  isAuthenticated: false,
  loadingCount: 0,
  setIsAuthenticated: throwContextError,
  setLoadingCount: throwContextError,
});
