import { IdTokenClaims } from '@logto/client';

export interface AuthState {
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  error?: Error;
  claims?: IdTokenClaims;
}

export const defaultAuthState: AuthState = {
  isLoading: false,
  isInitialized: false,
  isAuthenticated: false,
};
