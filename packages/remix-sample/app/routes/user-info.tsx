// eslint-disable-next-line consistent-default-export-name/default-export-match-filename
import type { LogtoContext } from '@logto/remix';
import { type LoaderFunction, json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { logto } from '../services/auth.server';

type LoaderResponse = {
  readonly context: LogtoContext;
};

export const loader: LoaderFunction = async ({ request }) => {
  // This will fetch the user info from Logto every time the route is loaded
  const context = await logto.getContext({ fetchUserInfo: true })(request);

  if (!context.isAuthenticated) {
    return redirect('/api/logto/sign-in');
  }

  return json<LoaderResponse>({ context });
};

const UserInfo = () => {
  const {
    context: { userInfo },
  } = useLoaderData<LoaderResponse>();

  return (
    <div>
      <h1>User Info</h1>
      <pre>{JSON.stringify(userInfo, null, 2)}</pre>
    </div>
  );
};

export default UserInfo;
