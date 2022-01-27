import React, { useEffect, useState, useContext } from 'react';

import LogtoClientContext from '@/LogtoClientContext';

const Callback = () => {
  const [error, setError] = useState<string>();
  const logtoClient = useContext(LogtoClientContext);

  useEffect(() => {
    (async () => {
      if (!logtoClient) {
        setError('LogtoClient not found');

        return;
      }

      try {
        await logtoClient.handleCallback(location.href);
        window.location.assign('/');
      } catch (error: unknown) {
        setError(String(error));
        console.error(error);
      }
    })();
  }, [logtoClient]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div>{error ?? 'Fetching token'}</div>
      {error && <a href="/">Home</a>}
    </div>
  );
};

export default Callback;
