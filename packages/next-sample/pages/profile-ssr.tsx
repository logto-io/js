import { type LogtoContext } from '@logto/next';
import { useMemo } from 'react';

import { logtoClient } from '../libraries/logto';

type Props = {
  readonly user: LogtoContext;
};

const ProfileSsr = ({ user }: Props) => {
  const userInfo = useMemo(() => {
    if (!user.isAuthenticated || !user.claims) {
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
            {Object.entries(user.claims).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [user]);

  return (
    <div>
      <header>
        <h1>Hello Logto.</h1>
      </header>
      {userInfo}
    </div>
  );
};

export default ProfileSsr;

export const getServerSideProps = logtoClient.withLogtoSsr(async function ({ req, res }) {
  const { user } = req;
  const { claims, isAuthenticated } = user;

  if (!isAuthenticated) {
    return {
      redirect: {
        destination: '/api/logto/sign-in',
        permanent: false,
      },
    };
  }

  return {
    props: { user: { isAuthenticated, claims } },
  };
});
