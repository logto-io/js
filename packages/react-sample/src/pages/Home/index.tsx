import { useLogto, IdTokenClaims } from '@logto/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { baseUrl, redirectUrl } from '../../consts';
import * as styles from './index.module.scss';

const Home = () => {
  const { isAuthenticated, signIn, signOut, getIdTokenClaims } = useLogto();
  const [idTokenClaims, setIdTokenClaims] = useState<IdTokenClaims>();

  useEffect(() => {
    if (isAuthenticated) {
      const claims = getIdTokenClaims();
      setIdTokenClaims(claims);
    }
  }, [getIdTokenClaims, isAuthenticated]);

  return (
    <div className={styles.container}>
      <h3>Logto React Sample</h3>
      {!isAuthenticated && (
        <button
          type="button"
          onClick={() => {
            void signIn(redirectUrl);
          }}
        >
          Sign In
        </button>
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
      {isAuthenticated && idTokenClaims && (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(idTokenClaims).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
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
