import { type LogtoContext } from '@logto/next';
import { useMemo } from 'react';
import useSWR from 'swr';

const Home = () => {
  // Use server's id token claims
  const { data } = useSWR<LogtoContext>('/api/logto/user');
  // Remote full user info
  const { data: dataWithUserInfo } = useSWR<LogtoContext>('/api/logto/user-info');

  const claims = useMemo(() => {
    if (!data?.isAuthenticated || !data.claims) {
      return null;
    }

    return (
      <div>
        <h2>Claims:</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.claims).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [data]);

  const userInfo = useMemo(() => {
    if (!dataWithUserInfo?.isAuthenticated || !dataWithUserInfo.userInfo) {
      return null;
    }

    return (
      <div>
        <h2>User info:</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(dataWithUserInfo.userInfo).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{JSON.stringify(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [dataWithUserInfo]);

  return (
    <div>
      <header>
        <h1>Hello Logto.</h1>
      </header>
      <nav>
        {data?.isAuthenticated ? (
          <button
            onClick={() => {
              window.location.assign('/api/logto/sign-out');
            }}
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => {
              window.location.assign('/api/logto/sign-in');
            }}
          >
            Sign In
          </button>
        )}
      </nav>
      {claims}
      {userInfo}
    </div>
  );
};

export default Home;
