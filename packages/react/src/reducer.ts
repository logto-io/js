import { AuthState } from './auth-state';

type Action =
  | { type: 'INITIALIZE'; payload: { isAuthenticated: boolean; isLoading: boolean } }
  | { type: 'LOGIN_WITH_REDIRECT' }
  | { type: 'HANDLE_CALLBACK_REQUEST' }
  | { type: 'HANDLE_CALLBACK_SUCCESS' }
  | { type: 'LOGOUT' }
  | { type: 'ERROR'; payload: { error: unknown } };

export const reducer = (state: AuthState, action: Action): AuthState => {
  if (action.type === 'INITIALIZE') {
    const { isAuthenticated, isLoading } = action.payload;
    return {
      ...state,
      isInitialized: true,
      isAuthenticated,
      isLoading,
    };
  }

  if (action.type === 'LOGIN_WITH_REDIRECT') {
    return { ...state, isLoading: true };
  }

  if (action.type === 'HANDLE_CALLBACK_REQUEST') {
    return { ...state, isLoading: true };
  }

  if (action.type === 'HANDLE_CALLBACK_SUCCESS') {
    return { ...state, isLoading: false, isAuthenticated: true };
  }

  if (action.type === 'LOGOUT') {
    return { ...state, isAuthenticated: false };
  }

  if (action.type === 'ERROR') {
    const { error } = action.payload;
    if (!(error instanceof Error)) {
      throw error;
    }

    return { ...state, error, isLoading: false };
  }

  return state;
};
