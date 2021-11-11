import React, { FC, useEffect } from 'react';
import { Route, RouteProps } from 'react-router-dom';

import useLogto from './use-logto';

const ProtectedRoute: FC<RouteProps> = ({ ...routeProperties }) => {
  const { isAuthenticated, isLoading, isInitialized, loginWithRedirect } = useLogto();

  useEffect(() => {
    if (!isInitialized || isLoading || isAuthenticated) {
      return;
    }

    void loginWithRedirect(window.location.href);
  }, [isAuthenticated, isInitialized, loginWithRedirect]);

  if (!isAuthenticated) {
    return null;
  }

  return <Route {...routeProperties} />;
};

export default ProtectedRoute;
