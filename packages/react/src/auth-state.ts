export interface AuthState {
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  error?: Error;
}

export const defaultAuthState: AuthState = {
  isLoading: false,
  isInitialized: false,
  isAuthenticated: false,
};
