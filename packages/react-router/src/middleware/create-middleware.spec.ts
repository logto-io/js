import type {
  LoaderFunctionArgs,
  MiddlewareFunction,
  RouterContextProvider,
  Session,
  SessionData,
  SessionStorage,
} from 'react-router';
import {
  createSession,
  createStaticHandler,
  RouterContextProvider as ContextProvider,
} from 'react-router';

import { createLogtoReactRouter } from '../create-logto-react-router.js';

const config = {
  endpoint: 'https://logto.example.com',
  appId: 'app-id',
  appSecret: 'app-secret',
  baseUrl: 'https://app.example.com',
};

const sessionCookie = 'logto-session=session-id';

const delay = async (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

type RouteHandler = (
  args: LoaderFunctionArgs<Readonly<RouterContextProvider>>
) => Response | Promise<Response>;

const createTestSessionStorage = (initialData: SessionData = {}) => {
  const sessions = new Map<string, SessionData>([['session-id', structuredClone(initialData)]]);
  const commitSession = vi.fn(async (session: Session) => {
    sessions.set('session-id', structuredClone(session.data));

    return `${sessionCookie}; Path=/; HttpOnly; SameSite=Lax`;
  });
  const sessionStorage: SessionStorage = {
    getSession: async () =>
      createSession(structuredClone(sessions.get('session-id') ?? {}), 'session-id'),
    commitSession,
    destroySession: async () => `${sessionCookie}; Max-Age=0`,
  };

  return {
    commitSession,
    sessionStorage,
    getData: () => structuredClone(sessions.get('session-id') ?? {}),
  };
};

const stubTokenRefresh = () => {
  const tokenRequest = vi.fn(async () => {
    await delay(10);

    return Response.json({
      access_token: 'access-token',
      refresh_token: 'rotated',
      scope: 'read',
      expires_in: 3600,
    });
  });
  const fetchRequest = vi.fn(async (input: string | URL | Request) => {
    const url = String(input);

    if (url.endsWith('/oidc/.well-known/openid-configuration')) {
      return Response.json({
        authorization_endpoint: `${config.endpoint}/oidc/auth`,
        token_endpoint: `${config.endpoint}/oidc/token`,
        userinfo_endpoint: `${config.endpoint}/oidc/me`,
        end_session_endpoint: `${config.endpoint}/oidc/session/end`,
        revocation_endpoint: `${config.endpoint}/oidc/token/revocation`,
        jwks_uri: `${config.endpoint}/oidc/jwks`,
        issuer: `${config.endpoint}/oidc`,
      });
    }

    if (url.endsWith('/oidc/token')) {
      return tokenRequest();
    }

    return new Response('Not found', { status: 404 });
  });

  vi.stubGlobal('fetch', fetchRequest);

  return tokenRequest;
};

const runRoute = async (
  middleware: MiddlewareFunction<Response>,
  handler: RouteHandler,
  method = 'GET'
) => {
  // `createStaticHandler` uses the Data Mode middleware type even when its response generator
  // supplies the Framework Mode response pipeline exercised here.
  const dataMiddleware: MiddlewareFunction = async (args, next) =>
    middleware(args, async () => {
      const result = await next();

      if (!(result instanceof Response)) {
        throw new TypeError('Expected downstream middleware to return a response.');
      }

      return result;
    });
  const staticHandler = createStaticHandler([
    {
      id: 'root',
      path: '/',
      middleware: [dataMiddleware],
      loader: handler,
      action: handler,
    },
  ]);
  const request = new Request('https://app.example.com/', {
    method,
    headers: { Cookie: sessionCookie },
  });
  const response: unknown = await staticHandler.queryRoute(request, {
    routeId: 'root',
    requestContext: new ContextProvider(),
    generateMiddlewareResponse: async (queryRoute) => {
      try {
        return await queryRoute(request);
      } catch (error: unknown) {
        return error instanceof Response
          ? error
          : new Response('Internal Server Error', { status: 500 });
      }
    },
  });

  if (!(response instanceof Response)) {
    throw new TypeError('Expected the route to return a response.');
  }

  return response;
};

describe('middleware:createLogtoMiddleware', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it.each([
    ['loader', 'GET'],
    ['action', 'POST'],
  ])('provides request context and commits mutations from a %s', async (source, method) => {
    const { sessionStorage, commitSession } = createTestSessionStorage();
    const logto = createLogtoReactRouter(config, { sessionStorage });
    const response = await runRoute(
      logto.middleware,
      ({ context }) => {
        context.get(logto.context).session.set('source', source);

        return new Response(source);
      },
      method
    );

    await expect(response.text()).resolves.toBe(source);
    expect(response.headers.get('Set-Cookie')).toBe(
      'logto-session=session-id; Path=/; HttpOnly; SameSite=Lax'
    );
    expect(commitSession).toHaveBeenCalledOnce();
  });

  it('commits mutations when a route throws an error', async () => {
    const { sessionStorage, commitSession } = createTestSessionStorage();
    const logto = createLogtoReactRouter(config, { sessionStorage });
    const response = await runRoute(logto.middleware, ({ context }) => {
      context.get(logto.context).session.flash('message', 'sign in required');

      throw new Error('loader failed');
    });

    expect(response.status).toBe(500);
    expect(response.headers.get('Set-Cookie')).toContain('logto-session=session-id');
    expect(commitSession).toHaveBeenCalledOnce();
  });

  it('adds the session cookie to an immutable redirect response', async () => {
    const { sessionStorage } = createTestSessionStorage();
    const logto = createLogtoReactRouter(config, { sessionStorage });
    const response = await runRoute(logto.middleware, ({ context }) => {
      context.get(logto.context).session.set('redirected', true);

      return Response.redirect('https://app.example.com/next');
    });

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://app.example.com/next');
    expect(response.headers.get('Set-Cookie')).toContain('logto-session=session-id');
  });

  it('coordinates access-token refreshes across concurrent requests', async () => {
    const store = createTestSessionStorage({ idToken: 'id-token', refreshToken: 'old' });
    const tokenRequest = stubTokenRefresh();
    const logto = createLogtoReactRouter(config, { sessionStorage: store.sessionStorage });
    const handler: RouteHandler = async ({ context }) => {
      const accessToken = await context.get(logto.context).getAccessToken();

      return new Response(accessToken);
    };

    const responses = await Promise.all([
      runRoute(logto.middleware, handler),
      runRoute(logto.middleware, handler),
    ]);

    await expect(Promise.all(responses.map(async (response) => response.text()))).resolves.toEqual([
      'access-token',
      'access-token',
    ]);
    expect(tokenRequest).toHaveBeenCalledOnce();
    expect(store.getData()).toMatchObject({ refreshToken: 'rotated' });
    expect(store.commitSession).toHaveBeenCalledOnce();
  });

  it('waits for a started access-token refresh before returning the response', async () => {
    vi.useFakeTimers();

    const store = createTestSessionStorage({ idToken: 'id-token', refreshToken: 'old' });
    const tokenRequest = stubTokenRefresh();
    const logto = createLogtoReactRouter(config, { sessionStorage: store.sessionStorage });
    const responsePromise = runRoute(logto.middleware, ({ context }) => {
      void context.get(logto.context).getAccessToken();

      return new Response('streaming response');
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(tokenRequest).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(10);

    const response = await responsePromise;

    expect(response.headers.get('Set-Cookie')).toContain('logto-session=session-id');
    expect(store.getData()).toMatchObject({ refreshToken: 'rotated' });
    expect(store.commitSession).toHaveBeenCalledOnce();
  });
});
