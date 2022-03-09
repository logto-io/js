import { useLogto } from '@logto/react';
import { useEffect } from 'react';

import { redirectUrl } from './consts';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, signIn } = useLogto();

  useEffect(() => {
    if (!isAuthenticated) {
      void signIn(redirectUrl);
    }
  }, [isAuthenticated, signIn]);

  return isAuthenticated ? children : null;
};

export default RequireAuth;
