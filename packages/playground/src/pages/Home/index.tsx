import React, { useCallback, useMemo, useContext } from 'react';

import LogtoClientContext from '@/LogtoClientContext';
import { baseUrl } from '@/consts/url';

import styles from './index.module.scss';

const Home = () => {
  const logtoClient = useContext(LogtoClientContext);

  if (!logtoClient) {
    throw new Error('no logto client found');
  }

  const isAuthed = useMemo(() => logtoClient.isAuthenticated(), [logtoClient]);
  const claims = isAuthed && logtoClient.getClaims();

  const signIn = useCallback(() => {
    void logtoClient.loginWithRedirect(`${baseUrl}/callback`);
  }, [logtoClient]);

  const signOut = useCallback(() => {
    logtoClient.logout(baseUrl);
  }, [logtoClient]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>Logto Playground</div>
      {!isAuthed && (
        <button type="button" onClick={signIn}>
          Sign In
        </button>
      )}
      {isAuthed && (
        <button type="button" onClick={signOut}>
          Sign Out
        </button>
      )}
      {claims && (
        <table className={styles.table}>
          <thead>
            <tr>
              <td>Name</td>
              <td>Value</td>
            </tr>
          </thead>
          <tbody>
            {Object.keys(claims).map((key) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{claims[key as keyof typeof claims]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Home;
