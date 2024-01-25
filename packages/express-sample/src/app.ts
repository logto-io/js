import http from 'node:http';

import type { LogtoExpressConfig } from '@logto/express';
import { handleAuthRoutes, withLogto } from '@logto/express';
import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import session from 'express-session';

const config: LogtoExpressConfig = {
  appId: 'appId', // Replace with your own appId
  appSecret: 'appSecret', // Replace with your own appSecret
  endpoint: 'http://localhost:3001',
  baseUrl: 'http://localhost:3000',
};

const requireAuth = async (request: Request, response: Response, next: NextFunction) => {
  if (!request.user.isAuthenticated) {
    response.redirect('/logto/sign-in');
  }

  next();
};

const app = express();
app.use(cookieParser());
app.use(
  session({
    secret: 'keyboard cat',
    cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(handleAuthRoutes(config));

app.get('/', (request, response) => {
  response.setHeader('content-type', 'text/html');
  response.end(
    `<h1>Hello Logto</h1>
      <div><a href="/logto/sign-in">Sign In</a></div>
      <div><a href="/logto/sign-out">Sign Out</a></div>
      <div><a href="/local-user-claims">Profile</a></div>
      <div><a href="/protected">Protected Resource</a></div>
      <div><a href="/remote-full-user">Fetch user info</a></div>
      <div><a href="/fetch-access-token">Fetch access token</a></div>
      <div><a href="/fetch-organization-token">Fetch organization token</a></div>`
  );
});

app.get('/local-user-claims', withLogto(config), (request, response) => {
  response.json(request.user);
});

app.get(
  '/remote-full-user',
  withLogto({
    ...config,
    // Fetch user info from remote, this may slowdown the response time, not recommended.
    fetchUserInfo: true,
  }),
  (request, response) => {
    response.json(request.user);
  }
);

app.get(
  '/fetch-access-token',
  withLogto({
    ...config,
    // Fetch access token from remote, this may slowdown the response time,
    // you can also add "resource" if needed.
    getAccessToken: true,
  }),
  (request, response) => {
    response.json(request.user);
  }
);

app.get(
  '/fetch-organization-token',
  withLogto({
    ...config,
    // Fetch organization token from remote
    // Remember to add "UserScope.Organizations" scope
    getOrganizationToken: true,
  }),
  (request, response) => {
    response.json(request.user);
  }
);

app.get('/protected', withLogto(config), requireAuth, (request, response) => {
  response.end('protected resource');
});

const server = http.createServer(app);
server.listen(3000, () => {
  console.log('Sample app listening on http://localhost:3000');
});
