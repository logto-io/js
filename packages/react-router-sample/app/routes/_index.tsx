/* eslint-disable consistent-default-export-name/default-export-match-filename */
import { type LogtoContext } from '@logto/react-router';
import { Link, type LoaderFunctionArgs } from 'react-router';

import { logto } from '../services/auth.server';

type LoaderResponse = {
  readonly context: LogtoContext;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const context = await logto.getContext({ getAccessToken: false })(request);

  // You can uncomment this to protect the route and
  // redirect to the sign-in page if the user is not authenticated
  //
  // if (!context.isAuthenticated) {
  //   return redirect('/api/logto/sign-in');
  // }

  return { context };
};

const Home = ({ loaderData }: { readonly loaderData: LoaderResponse }) => {
  const { context } = loaderData;
  const { isAuthenticated, claims } = context;

  return (
    <div>
      <h1>Remix Sample</h1>
      {isAuthenticated ? (
        <div>
          <p>Hello {claims?.email ?? claims?.name ?? claims?.sub}</p>
          <form action="/api/logto/sign-out" method="get">
            <button type="submit">Sign Out</button>
          </form>
          <p>
            <Link to="/user-info">Example of fetching user info</Link>
          </p>
          <p>
            <Link to="/access-token">Example of fetching access token</Link>
          </p>
        </div>
      ) : (
        <form action="/api/logto/sign-in" method="get">
          <button type="submit">Sign In</button>
        </form>
      )}
    </div>
  );
};

export default Home;
/* eslint-enable consistent-default-export-name/default-export-match-filename */
