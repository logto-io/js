import LogtoClient, { LogtoConfig } from '@logto/browser';
import { ReactNode, useEffect, useMemo, useState } from 'react';

import { LogtoContext } from './context';

export type LogtoProviderProps = {
  config: LogtoConfig;
  children?: ReactNode;
};

export const LogtoProvider = ({ config, children }: LogtoProviderProps) => {
  const [loadingCount, setLoadingCount] = useState(0);
  const memorizedLogtoClient = useMemo(() => ({ logtoClient: new LogtoClient(config) }), [config]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    (async () => {
      const isAuthenticated = await memorizedLogtoClient.logtoClient.isAuthenticated();

      setIsAuthenticated(isAuthenticated);
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
