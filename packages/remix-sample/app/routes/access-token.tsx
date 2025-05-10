// eslint-disable-next-line consistent-default-export-name/default-export-match-filename
import type { LogtoContext } from '@logto/remix';
import { type LoaderFunction, json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { logto } from '../services/auth.server';

type LoaderResponse = {
  readonly context: LogtoContext;
};

export const loader: LoaderFunction = async ({ request }) => {
  const context = await logto.getContext({ getAccessToken: true })(request);

  if (!context.isAuthenticated) {
    return redirect('/api/logto/sign-in');
  }

  // You can now use the access token here,
  // for demonstration purposes, we'll just pass it back to the client

  return json<LoaderResponse>({ context });
};

const AccessToken = () => {
  const {
    context: { accessToken },
  } = useLoaderData<LoaderResponse>();

  return (
    <div>
      <h1>Access Token</h1>
      <pre>{accessToken}</pre>
    </div>
  );
};

export default AccessToken;
