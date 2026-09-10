import { createLogtoReactRouter } from '../create-logto-react-router.js';

import type { RouteHandler } from './create-middleware.test-utils.js';
import {
  config,
  createTestSessionStorage,
  runRoute,
  stubLogtoFetch,
  waitForAbort,
} from './create-middleware.test-utils.js';

const delay = async (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

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
  stubLogtoFetch(tokenRequest);

  return tokenRequest;
};

describe('middleware:createLogtoMiddleware', () => {
  afterEach(() => {
    vi.restoreAllMocks();
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

  it('runs an authentication route through the request middleware runtime', async () => {
    const store = createTestSessionStorage();
    stubLogtoFetch();
    const logto = createLogtoReactRouter(config, { sessionStorage: store.sessionStorage });
    const authRoutes = logto.authRoutes({
      paths: {
        signIn: '/api/logto/sign-in',
        signUp: '/api/logto/sign-up',
        callback: '/api/logto/callback',
        signOut: '/api/logto/sign-out',
      },
      postCallbackRedirectUri: '/',
      postSignOutRedirectUri: '/',
    });
    const response = await runRoute(
      logto.middleware,
      authRoutes.action,
      'POST',
      '/api/logto/sign-in'
    );
    const location = new URL(response.headers.get('Location') ?? '');

    expect(location.origin + location.pathname).toBe(`${config.endpoint}/oidc/auth`);
    expect(location.searchParams.get('redirect_uri')).toBe(`${config.baseUrl}/api/logto/callback`);
    expect(response.headers.get('Set-Cookie')).toContain('logto-session=session-id');
    expect(store.getData()).toHaveProperty('signInSession');
    expect(store.commitSession).toHaveBeenCalledOnce();
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

  it('holds the session lock until a timed-out token request settles', async () => {
    const store = createTestSessionStorage({ idToken: 'id-token', refreshToken: 'old' });
    const abortObserved = vi.fn();
    const firstRequestAborted = new AbortController();
    const firstTokenRequestStarted = new AbortController();
    const settleFirstRequest = new AbortController();
    const firstTokenTimeoutController = new AbortController();
    const timeoutError = new DOMException(
      'The operation was aborted due to timeout',
      'TimeoutError'
    );
    vi.spyOn(AbortSignal, 'timeout').mockImplementation(() =>
      firstTokenRequestStarted.signal.aborted
        ? new AbortController().signal
        : firstTokenTimeoutController.signal
    );
    const tokenRequest = vi.fn(
      async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
        if (tokenRequest.mock.calls.length === 1) {
          const signal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
          signal?.addEventListener(
            'abort',
            () => {
              abortObserved();
              firstRequestAborted.abort();
            },
            { once: true }
          );
          firstTokenRequestStarted.abort();
          await waitForAbort(settleFirstRequest.signal);

          const abortReason: unknown = signal?.reason;
          throw abortReason instanceof Error ? abortReason : new Error('Token request aborted.');
        }

        return Response.json({
          access_token: 'access-token',
          refresh_token: 'rotated',
          scope: 'read',
          expires_in: 3600,
        });
      }
    );
    stubLogtoFetch(tokenRequest);
    const logto = createLogtoReactRouter(
      { ...config, requestTimeoutMs: 100 },
      { sessionStorage: store.sessionStorage }
    );
    const handler: RouteHandler = async ({ context }) => {
      const accessToken = await context.get(logto.context).getAccessToken();

      return new Response(accessToken);
    };

    const firstResponse = runRoute(logto.middleware, handler);
    await waitForAbort(firstTokenRequestStarted.signal);
    expect(tokenRequest).toHaveBeenCalledOnce();

    const secondResponse = runRoute(logto.middleware, handler);
    firstTokenTimeoutController.abort(timeoutError);
    await waitForAbort(firstRequestAborted.signal);

    expect(tokenRequest).toHaveBeenCalledOnce();
    expect(abortObserved).toHaveBeenCalledOnce();

    settleFirstRequest.abort();

    const [first, second] = await Promise.all([firstResponse, secondResponse]);

    expect(first.status).toBe(500);
    await expect(second.text()).resolves.toBe('access-token');
    expect(tokenRequest).toHaveBeenCalledTimes(2);
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
