export interface AuthState {
  isLoading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  error?: Error;
}

export const initialAuthState: AuthState = {
  isLoading: false,
  initialized: false,
  isAuthenticated: false,
};
