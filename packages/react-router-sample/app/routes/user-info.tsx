// eslint-disable-next-line consistent-default-export-name/default-export-match-filename
import type { LogtoContext } from '@logto/remix';
import { type LoaderFunctionArgs, redirect } from 'react-router';

import { logto } from '../services/auth.server';

type LoaderResponse = {
  readonly context: LogtoContext;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // This will fetch the user info from Logto every time the route is loaded
  const context = await logto.getContext({ fetchUserInfo: true })(request);

  if (!context.isAuthenticated) {
    return redirect('/api/logto/sign-in');
  }

  return { context };
};

const UserInfo = ({ loaderData }: { readonly loaderData: LoaderResponse }) => {
  const {
    context: { userInfo },
  } = loaderData;

  return (
    <div>
      <h1>User Info</h1>
      <pre>{JSON.stringify(userInfo, null, 2)}</pre>
    </div>
  );
};

export default UserInfo;
