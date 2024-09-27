import { useLogto } from '@logto/react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { redirectUrl } from '../../consts';

const SsoDirectSignIn = () => {
  const { isAuthenticated, signIn } = useLogto();
  const { connectorId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated || !connectorId) {
      navigate('/');
    } else {
      void signIn({
        redirectUri: redirectUrl,
        directSignIn: {
          method: 'sso',
          target: connectorId,
        },
      });
    }
  }, [connectorId, isAuthenticated, navigate, signIn]);

  return null;
};

export default SsoDirectSignIn;
