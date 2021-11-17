import { useLogto } from '@logto/react';
import React, { useEffect } from 'react';

const Callback = () => {
  const { isLoading, isInitialized, error, isAuthenticated } = useLogto();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.assign('/');
    }
  }, [isAuthenticated]);

  if (!isInitialized || isLoading) {
    return <div>fetching...</div>;
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div>{error ?? 'Fetching token'}</div>
      {error && <a href="/">Home</a>}
    </div>
  );
};

export default Callback;
