import http from 'node:http';

import cookieParser from 'cookie-parser';
import express, { type Request } from 'express';
import session from 'express-session';
import passport from 'passport';

import { config } from './config.js';
import initPassport from './passport.js';

const { appId, endpoint, cookieSecret } = config;

initPassport();

const app = express();
app.use(cookieParser());
app.use(
  session({
    secret: cookieSecret,
    cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.authenticate('session'));

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
app.get('/sign-in', passport.authenticate('openidconnect'));

app.get(
  '/callback',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  passport.authenticate('openidconnect', {
    successReturnToOrRedirect: '/',
  })
);

app.get('/sign-out', (request, response, next) => {
  request.logout((error) => {
    if (error) {
      next(error);
      return;
    }
    response.redirect(`${endpoint}/oidc/session/end?client_id=${appId}`);
  });
});

app.get('/', (request: Request<never, never, { id: string }>, response) => {
  const { user } = request;
  response.setHeader('content-type', 'text/html');

  if (user) {
    response.end(
      `<h1>Hello Logto</h1><p>Signed in as ${JSON.stringify(
        user
      )}, <a href="/sign-out">Sign Out</a></p>`
    );
  } else {
    response.end(`<h1>Hello Logto</h1><p><a href="/sign-in">Sign In</a></p>`);
  }
});

const server = http.createServer(app);
server.listen(3000, () => {
  console.log('Sample app listening on http://localhost:3000');
});
