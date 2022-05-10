import { useHandleSignInCallback } from '@logto/react';
import React from 'react';

const Callback = () => {
  const { isLoading } = useHandleSignInCallback('/');

  return isLoading ? <p>Redirecting...</p> : null;
};

export default Callback;
