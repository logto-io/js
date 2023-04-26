import LogtoClient, { type LogtoConfig } from '@logto/browser';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { LogtoContext } from './context.js';

export type LogtoProviderProps = {
  config: LogtoConfig;
  children?: ReactNode;
};

export const LogtoProvider = ({ config, children }: LogtoProviderProps) => {
  const [loadingCount, setLoadingCount] = useState(1);
  const memorizedLogtoClient = useMemo(() => ({ logtoClient: new LogtoClient(config) }), [config]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<Error>();

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
      loadingCount,
      setLoadingCount,
      error,
      setError,
    }),
    [memorizedLogtoClient, isAuthenticated, loadingCount, error]
  );

  return <LogtoContext.Provider value={memorizedContextValue}>{children}</LogtoContext.Provider>;
};
