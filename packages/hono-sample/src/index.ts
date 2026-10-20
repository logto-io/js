import { serve } from '@hono/node-server';
import type { LogtoHonoConfig, LogtoVariables } from '@logto/hono';
import { handleAuthRoutes, withLogto } from '@logto/hono';
import { Hono } from 'hono';

const config: LogtoHonoConfig = {
  endpoint: process.env.LOGTO_ENDPOINT ?? 'http://localhost:3001',
  appId: process.env.LOGTO_APP_ID ?? 'appId',
  appSecret: process.env.LOGTO_APP_SECRET ?? 'appSecret',
  baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',
  // Replace with a long random string and keep it secret.
  encryptionKey: process.env.LOGTO_COOKIE_ENCRYPTION_KEY ?? 'replace-with-a-random-string',
};

const app = new Hono<{ Variables: LogtoVariables }>();

app.route('/', handleAuthRoutes(config));

app.get('/', (context) => {
  return context.html(
    `<h1>Hello Logto</h1>
      <div><a href="/logto/sign-in">Sign In</a></div>
      <div><a href="/logto/sign-up">Sign Up</a></div>
      <div><a href="/logto/sign-out">Sign Out</a></div>
      <div><a href="/local-user-claims">Profile</a></div>
      <div><a href="/protected">Protected Resource</a></div>
      <div><a href="/remote-full-user">Fetch user info</a></div>
      <div><a href="/fetch-access-token">Fetch access token</a></div>
      <div><a href="/fetch-organization-token">Fetch organization token</a></div>`
  );
});

app.get('/local-user-claims', withLogto(config), (context) => {
  return context.json(context.var.logto);
});

app.get(
  '/remote-full-user',
  // Fetch user info from remote, this may slow down the response time, not recommended.
  withLogto({ ...config, fetchUserInfo: true }),
  (context) => {
    return context.json(context.var.logto);
  }
);

app.get(
  '/fetch-access-token',
  // Add `resource` in the config if you need an access token for a specific API resource.
  withLogto({ ...config, getAccessToken: true }),
  (context) => {
    return context.json(context.var.logto);
  }
);

app.get(
  '/fetch-organization-token',
  // Remember to add `UserScope.Organizations` to the `scopes` config.
  withLogto({ ...config, getOrganizationToken: true }),
  (context) => {
    return context.json(context.var.logto);
  }
);

app.get('/protected', withLogto(config), (context) => {
  if (!context.var.logto.isAuthenticated) {
    return context.redirect('/logto/sign-in');
  }

  return context.text('protected resource');
});

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Sample app listening on http://localhost:${info.port}`);
});
