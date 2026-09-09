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

export const config = {
  endpoint: 'https://logto.example.com',
  appId: 'app-id',
  appSecret: 'app-secret',
  baseUrl: 'https://app.example.com',
};

const sessionCookie = 'logto-session=session-id';

type TestSessionStore = Readonly<{
  commitSession: (session: Session) => Promise<string>;
  sessionStorage: SessionStorage;
  getData: () => SessionData;
}>;

type FetchFunction = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export type RouteHandler = (
  args: LoaderFunctionArgs<Readonly<RouterContextProvider>>
) => Response | Promise<Response>;

export const waitForAbort = async (signal: AbortSignal) => {
  if (signal.aborted) {
    return;
  }

  await new Promise<void>((resolve) => {
    signal.addEventListener(
      'abort',
      () => {
        resolve();
      },
      { once: true }
    );
  });
};

export const createTestSessionStorage = (initialData: SessionData = {}): TestSessionStore => {
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

export const stubLogtoFetch = (tokenRequest?: FetchFunction): void => {
  const fetchRequest = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);

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

    if (url.endsWith('/oidc/token') && tokenRequest) {
      return tokenRequest(input, init);
    }

    return new Response('Not found', { status: 404 });
  });

  vi.stubGlobal('fetch', fetchRequest);
};

export const runRoute = async (
  middleware: MiddlewareFunction<Response>,
  handler: RouteHandler,
  method = 'GET',
  path = '/'
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
      path: '*',
      middleware: [dataMiddleware],
      loader: handler,
      action: handler,
    },
  ]);
  const request = new Request(`${config.baseUrl}${path}`, {
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
