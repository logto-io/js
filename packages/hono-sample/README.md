# Logto Hono sample

A minimal Hono app using [`@logto/hono`](../hono).

## Run

Build the SDK packages first, then start the sample:

```bash
pnpm --filter @logto/hono... build
pnpm --filter @logto/hono-sample start
```

The app listens on <http://localhost:3000>.

## Environment variables

| Name | Description |
| --- | --- |
| `LOGTO_ENDPOINT` | Your Logto endpoint, e.g. `http://localhost:3001`. |
| `LOGTO_APP_ID` | The app ID from Logto Console. |
| `LOGTO_APP_SECRET` | The app secret from Logto Console. |
| `BASE_URL` | The base URL of this sample, defaults to `http://localhost:3000`. Register `http://localhost:3000/logto/sign-in-callback` as the redirect URI in Logto Console. |
| `LOGTO_COOKIE_ENCRYPTION_KEY` | A long random string used to encrypt the session cookie. |
