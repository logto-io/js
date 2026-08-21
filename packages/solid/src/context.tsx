import type LogtoClient from '@logto/browser';
import {Accessor, createContext} from 'solid-js';

export type LogtoContextProps = {
  /** The underlying LogtoClient instance (from `@logto/browser`). */
  logtoClient: Accessor<LogtoClient | undefined>;
  /** Whether the user is authenticated or not. */
  isAuthenticated: Accessor<boolean>;
  /** Whether the context has any pending requests. It will be `true` if there is at least one request pending. */
  isLoading: Accessor<boolean>;
  /** The error that occurred during the last request. If there was no error, this will be `undefined`. */
  error: Accessor<Error | undefined>;
  /** Sets the authentication state. */
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  /**
   * Sets the loading state.
   *
   * @remarks
   * Instead of directly setting the boolean value, this function will increment or decrement the
   * loading count.
   *
   * - If the `state` is `true`, the loading count will be incremented by 1.
   * - If the `state` is `false`, the loading count will be decremented by 1. If the loading count
   *   is already 0, it will be set to 0.
   */
  setLoading: (state: boolean) => void;
  /** Sets the error state. To clear the error, set this to `undefined`. */
  setError: (error: unknown, fallbackErrorMessage?: string | undefined) => void;
};

export const throwContextError = (): never => {
  throw new Error('Must be used inside <LogtoProvider> context.');
};

/**
 * The context for the LogtoProvider.
 *
 * @remarks
 * Instead of using this context directly, in most cases you should use the `useLogto` hook.
 */
export const LogtoContext = createContext<LogtoContextProps>({
  logtoClient: () => undefined,
  isAuthenticated: () => false,
  isLoading: () => false,
  error: () => undefined,
  setIsAuthenticated: throwContextError,
  setLoading: throwContextError,
  setError: throwContextError,
});
