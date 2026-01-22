import LogtoClient, { type LogtoConfig } from '@logto/browser';
import { createMemo, createSignal, JSX } from "solid-js";
import { LogtoContext } from './context';

export type LogtoProviderProps = {
  config: LogtoConfig;
  /**
   * Whether to enable cache for well-known data. Use sessionStorage by default.
   * @default false
   */
  // eslint-disable-next-line react/boolean-prop-naming
  unstable_enableCache?: boolean;
  LogtoClientClass?: typeof LogtoClient;
  children: JSX.Element;
};

export const LogtoProvider = (props: LogtoProviderProps) => {
  const LogtoClientClass = props.LogtoClientClass || LogtoClient;
  const [loadingCount, setLoadingCount] = createSignal(1);

  const logtoClient = createMemo(() => {
    return new LogtoClientClass(props.config, props.unstable_enableCache)
  })
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);
  const [error, setError] = createSignal<Error>();

  const isLoading = () => {
    return loadingCount() > 0;
  }
  const setLoading = (isLoading: boolean) => {
    if (isLoading) {
      setLoadingCount(loadingCount() + 1);
    } else {
      setLoadingCount(Math.max(0, loadingCount() - 1));
    }
  };

  (async () => {
    const isAuthenticated = await logtoClient().isAuthenticated();

    setIsAuthenticated(isAuthenticated);
    setLoading(false);
  })();

  return <LogtoContext.Provider value={{
    logtoClient,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    setLoading,
    error,
    setError: (_error: unknown, fallbackErrorMessage?: string) => {
      if (_error instanceof Error) {
        setError(_error);
      } else if (fallbackErrorMessage) {
        setError(new Error(fallbackErrorMessage));
      }
      console.error(error);
    },
  }}>{props.children}</LogtoContext.Provider>;
};
