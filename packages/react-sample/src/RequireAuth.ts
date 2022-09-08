import { useLogto } from '@logto/react';
import { useEffect } from 'react';

import { redirectUrl } from './consts';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading, signIn } = useLogto();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      void signIn(redirectUrl);
    }
  }, [isAuthenticated, isLoading, signIn]);

  return isAuthenticated ? children : null;
};

export default RequireAuth;
