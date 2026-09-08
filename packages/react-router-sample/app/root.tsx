/* eslint-disable consistent-default-export-name/default-export-match-filename */
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type MiddlewareFunction,
} from 'react-router';

import { logto } from './services/auth.server';

export const middleware = [logto.middleware] satisfies Array<MiddlewareFunction<Response>>;

const App = () => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div>
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

export default App;
/* eslint-enable consistent-default-export-name/default-export-match-filename */
