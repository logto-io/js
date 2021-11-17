import { IDToken } from '@logto/client';

export interface AuthState {
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  error?: Error;
  claims?: IDToken;
}

export const defaultAuthState: AuthState = {
  isLoading: false,
  isInitialized: false,
  isAuthenticated: false,
};
