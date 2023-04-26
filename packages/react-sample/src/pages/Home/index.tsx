import { useLogto, type UserInfoResponse } from '@logto/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { baseUrl, redirectUrl } from '../../consts';

import * as styles from './index.module.scss';

const Home = () => {
  const { isAuthenticated, signIn, signOut, fetchUserInfo } = useLogto();
  const [user, setUser] = useState<UserInfoResponse>();

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        const userInfo = await fetchUserInfo();
        setUser(userInfo);
      }
    })();
  }, [setUser, fetchUserInfo, isAuthenticated]);

  return (
    <div className={styles.container}>
      <h3>Logto React Sample</h3>
      {!isAuthenticated && (
        <>
          <button
            type="button"
            onClick={() => {
              void signIn(redirectUrl);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              void signIn(redirectUrl, 'signUp');
            }}
          >
            Sign Up
          </button>
        </>
      )}
      {isAuthenticated && (
        <button
          type="button"
          onClick={() => {
            void signOut(baseUrl);
          }}
        >
          Sign Out
        </button>
      )}
      {isAuthenticated && user && (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(user).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{typeof value === 'string' ? value : JSON.stringify(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/protected-resource">View Protected Resource</Link>
        </>
      )}
    </div>
  );
};

export default Home;
