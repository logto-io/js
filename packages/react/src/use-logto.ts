import { useContext } from 'react';

import { LogtoContext } from './context';

export default function useLogto() {
  const context = useContext(LogtoContext);

  if (!('logtoClient' in context)) {
    throw new Error('useLogto hook must be used inside LogtoProvider context');
  }

  const { logtoClient, isAuthenticated } = context;

  const isLoading = !logtoClient;

  return {
    logtoClient,
    isLoading,
    isAuthenticated,
  };
}
