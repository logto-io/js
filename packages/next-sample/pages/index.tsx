import { type LogtoContext } from '@logto/next';
import Link from 'next/link';
import { useMemo } from 'react';
import useSWR from 'swr';

const Home = () => {
  // Use server's id token claims
  const { data } = useSWR<LogtoContext>('/api/logto/user');
  // Remote full user info
  const { data: dataWithUserInfo } = useSWR<LogtoContext>('/api/logto/user-info');
  const { data: protectedResource } = useSWR<{ data: string }>('/api/protected-resource');
  const { data: rbacResponse, error: rbacResponseError } = useSWR<{ data: string }, Error>(
    '/api/rbac-scope'
  );
  const { data: organizationsInfo } = useSWR<{ organizations: string[] }>('/api/organizations');

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
      {protectedResource && (
        <div>
          <h2>Protected resource:</h2>
          <div>{protectedResource.data}</div>
          <h3>
            <Link href="/protected">Example1: Require sign in and auto redirect</Link>
          </h3>
          <h3>
            <Link href="/profile-ssr">Example2: Server-render page with getServerSideProps</Link>
          </h3>
        </div>
      )}
      <div>
        <h2>Protected by RBAC scope:</h2>
        <div>{rbacResponse?.data}</div>
        <div>{rbacResponseError && 'Access denied.'}</div>
      </div>
      {organizationsInfo && (
        <div>
          <h2>Organizations</h2>
          {organizationsInfo.organizations.map((organizationId) => (
            <div key={organizationId}>{organizationId}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
