import LogtoClient, { LogtoConfig } from '@logto/browser';
import React, { useMemo, useState } from 'react';

import { LogtoContext } from './context';

export type LogtoProviderProps = {
  logtoConfig: LogtoConfig;
  children?: React.ReactNode;
};

export const LogtoProvider = ({ logtoConfig, children }: LogtoProviderProps) => {
  const [loadingCount, setLoadingCount] = useState(0);
  const memorizedLogtoClient = useMemo(
    () => ({ logtoClient: new LogtoClient(logtoConfig) }),
    [logtoConfig]
  );
  const memorizedContextValue = useMemo(
    () => ({
      ...memorizedLogtoClient,
      loadingCount,
      setLoadingCount,
    }),
    [memorizedLogtoClient, loadingCount]
  );

  return <LogtoContext.Provider value={memorizedContextValue}>{children}</LogtoContext.Provider>;
};
