// eslint-disable-next-line consistent-default-export-name/default-export-match-filename
import type { LogtoContext } from '@logto/react-router';
import { redirect, type LoaderFunctionArgs } from 'react-router';

import { logto } from '../services/auth.server';

type LoaderResponse = {
  readonly context: LogtoContext;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const context = await logto.getContext({ getAccessToken: true })(request);

  if (!context.isAuthenticated) {
    return redirect('/api/logto/sign-in');
  }

  // You can now use the access token here,
  // for demonstration purposes, we'll just pass it back to the client

  return { context };
};

const AccessToken = ({ loaderData }: { readonly loaderData: LoaderResponse }) => {
  const {
    context: { accessToken },
  } = loaderData;

  return (
    <div>
      <h1>Access Token</h1>
      <pre>{accessToken}</pre>
    </div>
  );
};

export default AccessToken;
