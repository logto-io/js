import ky from 'ky';
import qs from 'query-string';
import React, { useEffect, useState } from 'react';

import { baseUrl, oidcUrl } from '@/consts/url';

const Callback = () => {
  const [error, setError] = useState<string>();

  useEffect(() => {
    const { code, error } = qs.parse(location.search);

    if (error) {
      setError('Error:' + String(error));
      return;
    }

    const verifier = localStorage.getItem('verifier');
    const run = async () => {
      if (typeof code !== 'string') {
        setError("code doesn't show up in url");
        return;
      }

      if (typeof verifier !== 'string') {
        setError("verifier doesn't show up in localStorage");
        return;
      }

      // For `application/x-www-form-urlencoded`
      const body = new URLSearchParams();
      body.set('redirect_uri', `${baseUrl}/callback`);
      body.set('code', code);
      body.set('grant_type', 'authorization_code');
      body.set('client_id', 'foo');
      body.set('code_verifier', verifier);

      try {
        const json = await ky.post(`${oidcUrl}/token`, { body }).json();

        localStorage.setItem('auth', JSON.stringify(json));
        localStorage.removeItem('verifier');
        window.location.assign('/');
      } catch (error: unknown) {
        setError(String(error));
        console.error(error);
      }
    };

    void run();
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <div>{error ?? 'Fetching token'}</div>
      {error && <a href="/">Home</a>}
    </div>
  );
};

export default Callback;
