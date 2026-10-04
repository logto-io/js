// eslint-disable-next-line consistent-default-export-name/default-export-match-filename
import { redirect } from 'react-router';

import { logto } from '../services/auth.server';

import type { Route } from './+types/user-info';

export const loader = async ({ context }: Route.LoaderArgs) => {
  // This will fetch the user info from Logto every time the route is loaded
  const authentication = await context.get(logto.context).getContext({ fetchUserInfo: true });

  if (!authentication.isAuthenticated) {
    return redirect('/');
  }

  return { userInfo: authentication.userInfo };
};

const UserInfo = ({ loaderData }: Route.ComponentProps) => {
  return (
    <div>
      <h1>User Info</h1>
      <pre>{JSON.stringify(loaderData.userInfo, null, 2)}</pre>
    </div>
  );
};

export default UserInfo;
