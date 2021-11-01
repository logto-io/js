import LogtoClient, { ConfigParameters } from '@logto/client';
import React, { useEffect, useState } from 'react';

import { LogtoContext } from './context';

export interface LogtoProviderProperties {
  logtoConfig: ConfigParameters;
  children?: React.ReactNode;
}

export const LogtoProvider = ({ logtoConfig, children }: LogtoProviderProperties) => {
  const [logtoClient, setLogtoClient] = useState<LogtoClient>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const createClient = async () => {
      const client = await LogtoClient.create({
        ...logtoConfig,
        onAuthStateChange: () => {
          setIsAuthenticated(client.isAuthenticated());
        },
      });
      setLogtoClient(client);
    };

    void createClient();
  }, [logtoConfig]);

  return (
    <LogtoContext.Provider value={{ logtoClient, isAuthenticated }}>
      {children}
    </LogtoContext.Provider>
  );
};
