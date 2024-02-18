import LogtoClient, { type LogtoConfig } from '@logto/browser';
import { type ReactNode, useEffect, useMemo, useState, useCallback } from 'react';

import { LogtoContext } from './context.js';

export type LogtoProviderProps = {
  config: LogtoConfig;
  /**
   * Whether to enable cache for well-known data. Use sessionStorage by default.
   * @default false
   */
  // eslint-disable-next-line react/boolean-prop-naming
  unstable_enableCache?: boolean;
  children?: ReactNode;
};

export const LogtoProvider = ({
  config,
  children,
  unstable_enableCache = false,
}: LogtoProviderProps) => {
  const [loadingCount, setLoadingCount] = useState(1);
  const memorizedLogtoClient = useMemo(
    () => ({ logtoClient: new LogtoClient(config, unstable_enableCache) }),
    [config, unstable_enableCache]
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<Error>();

  const isLoading = useMemo(() => loadingCount > 0, [loadingCount]);
  const setIsLoading = useCallback(
    (state: boolean) => {
      if (state) {
        setLoadingCount((count) => count + 1);
      } else {
        setLoadingCount((count) => Math.max(0, count - 1));
      }
    },
    [setLoadingCount]
  );

  useEffect(() => {
    (async () => {
      const isAuthenticated = await memorizedLogtoClient.logtoClient.isAuthenticated();

      setIsAuthenticated(isAuthenticated);
      setLoadingCount((count) => Math.max(0, count - 1));
    })();
  }, [memorizedLogtoClient]);

  const memorizedContextValue = useMemo(
    () => ({
      ...memorizedLogtoClient,
      isAuthenticated,
      setIsAuthenticated,
      isLoading,
      setIsLoading,
      error,
      setError,
    }),
    [memorizedLogtoClient, isAuthenticated, isLoading, setIsLoading, error]
  );

  return <LogtoContext.Provider value={memorizedContextValue}>{children}</LogtoContext.Provider>;
};
