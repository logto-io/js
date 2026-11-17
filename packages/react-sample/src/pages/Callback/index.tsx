import { useHandleSignInCallback } from '@logto/react';
import { useNavigate } from 'react-router';

const Callback = () => {
  const navigate = useNavigate();
  const { isLoading } = useHandleSignInCallback(() => {
    void navigate('/');
  });

  return isLoading ? <p>Redirecting...</p> : null;
};

export default Callback;
