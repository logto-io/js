import LogtoClient from '@logto/client';
import { createContext } from 'react';

export interface LogtoContextProperties {
  logtoClient?: LogtoClient;
  isAuthenticated: boolean;
}

export const LogtoContext = createContext<LogtoContextProperties>({ isAuthenticated: false });
