import { Prompt, useLogto } from '@logto/react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { redirectUrl } from '../../consts';

const SsoDirectSignIn = () => {
  const { isAuthenticated, signIn } = useLogto();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const connectorId = searchParams.get('ssoConnectorId');

    if (connectorId) {
      void signIn({
        redirectUri: redirectUrl,
        prompt: Prompt.Login,
        directSignIn: {
          method: 'sso',
          target: connectorId,
        },
      });
      return;
    }

    navigate('/');
  }, [searchParams, isAuthenticated, navigate, signIn]);

  return null;
};

export default SsoDirectSignIn;
