// eslint-disable-next-line consistent-default-export-name/default-export-match-filename
import { redirect } from 'react-router';

import { logto } from '../services/auth.server';

import type { Route } from './+types/access-token';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const logtoContext = context.get(logto.context);
  const authentication = await logtoContext.getContext();

  if (!authentication.isAuthenticated) {
    return redirect('/');
  }

  const accessToken = await logtoContext.getAccessToken();

  // Use the token in this server loader. This sample returns it only for demonstration.
  return { accessToken };
};

const AccessToken = ({ loaderData }: Route.ComponentProps) => {
  return (
    <div>
      <h1>Access Token</h1>
      <pre>{loaderData.accessToken}</pre>
    </div>
  );
};

export default AccessToken;
