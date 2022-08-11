import http from 'http';

import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';

import { logtoClient } from './logto';

const requireAuth = async (request: Request, response: Response, next: NextFunction) => {
  if (!request.user.isAuthenticated) {
    response.redirect('/logto/sign-in');
  }

  next();
};

const app = express();
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 14 * 24 * 60 * 60 } }));
app.use(logtoClient.handleAuthRoutes());
app.use(logtoClient.withLogto());

app.get('/', (request, response) => {
  response.setHeader('content-type', 'text/html');
  response.end(
    `<h1>Hello Logto</h1>
      <div><a href="/logto/sign-in">Sign In</a></div>
      <div><a href="/logto/sign-out">Sign Out</a></div>
      <div><a href="/user">Profile</a></div>
      <div><a href="/protected">Protected Resource</a></div>`
  );
});

app.get('/user', (request, response) => {
  response.json(request.user);
});

app.get('/protected', requireAuth, (request, response) => {
  response.end('protected resource');
});

const server = http.createServer(app);
server.listen(3000, () => {
  console.log('Sample app listening on http://localhost:3000');
});
