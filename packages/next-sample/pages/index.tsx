import { LogtoUser } from '@logto/next';
import Link from 'next/link';
import useSWR from 'swr';

const Home = () => {
  const { data } = useSWR<LogtoUser>('/api/user');
  const { data: protectedResource } = useSWR<{ data: string }>('/api/protected-resource');

  if (!data) {
    return null;
  }

  return (
    <div>
      Hello Logto.{' '}
      {data.isAuthenticated ? (
        <Link href="/api/sign-out">
          <a>Sign Out</a>
        </Link>
      ) : (
        <Link href="/api/sign-in">
          <a>Sign In</a>
        </Link>
      )}
      {data.isAuthenticated && data.claims && (
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
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div>{protectedResource?.data}</div>
    </div>
  );
};

export default Home;
