import { useLogto } from '@logto/react';
import React from 'react';

import { baseUrl } from '@/consts/url';

import styles from './index.module.scss';

const Home = () => {
  const { logout, loginWithRedirect, isAuthenticated, claims, isInitialized, isLoading } =
    useLogto();

  if (!isInitialized || isLoading) {
    return <div className={styles.wrapper}>fetching...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>Logto React Playground</div>
      {!isAuthenticated && (
        <button
          type="button"
          onClick={() => {
            void loginWithRedirect(`${baseUrl}/callback`);
          }}
        >
          Sign In
        </button>
      )}
      {isAuthenticated && (
        <button
          type="button"
          onClick={() => {
            logout(baseUrl);
          }}
        >
          Sign Out
        </button>
      )}
      {isAuthenticated && claims && (
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
