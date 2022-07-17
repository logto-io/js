import LogtoClient, { LogtoConfig } from '@logto/browser';
import { ReactNode, useMemo, useState } from 'react';

import { LogtoContext } from './context';

export type LogtoProviderProps = {
  config: LogtoConfig;
  children?: ReactNode;
};

export const LogtoProvider = ({ config, children }: LogtoProviderProps) => {
  const [loadingCount, setLoadingCount] = useState(0);
  const memorizedLogtoClient = useMemo(() => ({ logtoClient: new LogtoClient(config) }), [config]);
  const [isAuthenticated, setIsAuthenticated] = useState(
    memorizedLogtoClient.logtoClient.isAuthenticated
  );
  const [error, setError] = useState<Error>();
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
