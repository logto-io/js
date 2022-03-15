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
