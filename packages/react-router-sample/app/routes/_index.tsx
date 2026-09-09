/* eslint-disable consistent-default-export-name/default-export-match-filename */
import { Form, Link } from 'react-router';

import { logto } from '../services/auth.server';

import type { Route } from './+types/_index';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authentication = await context.get(logto.context).getContext();

  // You can uncomment this to protect the route and
  // redirect to an application page that contains a POST sign-in form
  //
  // if (!authentication.isAuthenticated) {
  //   return redirect('/sign-in');
  // }

  return { authentication };
};

const Home = ({ loaderData }: Route.ComponentProps) => {
  const { isAuthenticated, claims } = loaderData.authentication;

  return (
    <div>
      <h1>React Router Sample</h1>
      {isAuthenticated ? (
        <div>
          <p>Hello {claims?.email ?? claims?.name ?? claims?.sub}</p>
          <Form action="/api/logto/sign-out" method="post">
            <button type="submit">Sign Out</button>
          </Form>
          <p>
            <Link to="/user-info">Example of fetching user info</Link>
          </p>
          <p>
            <Link to="/access-token">Example of fetching access token</Link>
          </p>
        </div>
      ) : (
        <Form action="/api/logto/sign-in" method="post">
          <button type="submit">Sign In</button>
        </Form>
      )}
    </div>
  );
};

export default Home;
/* eslint-enable consistent-default-export-name/default-export-match-filename */
