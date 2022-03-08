import LogtoClient from '@logto/browser';
import { createContext } from 'react';

export type LogtoContextProps = {
  logtoClient?: LogtoClient;
  loadingCount: number;
  setLoadingCount: React.Dispatch<React.SetStateAction<number>>;
};

export const LogtoContext = createContext<LogtoContextProps>({
  logtoClient: undefined,
  loadingCount: 0,
  setLoadingCount: (): never => {
    throw new Error('Must be used inside <LogtoProvider>');
  },
});
