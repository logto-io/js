import LogtoClient, { LogtoConfig } from '@logto/browser';
import React, { ReactNode, useMemo, useState } from 'react';

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
  const memorizedContextValue = useMemo(
    () => ({
      ...memorizedLogtoClient,
      isAuthenticated,
      setIsAuthenticated,
      loadingCount,
      setLoadingCount,
    }),
    [memorizedLogtoClient, isAuthenticated, loadingCount]
  );

  return <LogtoContext.Provider value={memorizedContextValue}>{children}</LogtoContext.Provider>;
};
