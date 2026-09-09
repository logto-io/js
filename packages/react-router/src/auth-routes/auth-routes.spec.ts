import type { SignInOptions } from '@logto/node';
import type { Session, SessionData, SessionStorage } from 'react-router';
import {
  createContext,
  createSession,
  RouterContextProvider as ContextProvider,
} from 'react-router';

import { createProcessLocalSessionCoordinator } from '../infrastructure/session/index.js';
import { SessionRuntime } from '../infrastructure/session/session-runtime.js';

import type {
  AuthRoutePaths,
  ResolvePostCallbackRedirectUri,
  ValidateAuthActionRequest,
} from './auth-routes.js';
import { createAuthRoutes } from './auth-routes.js';
import type {
  CreateLogtoAuthClient,
  LogtoAuthClient,
  LogtoAuthRequestRuntime,
} from './request-runtime.js';

const baseUrl = 'https://app.example.com';
const sessionCookie = 'logto-session=session-id';
const paths = {
  signIn: '/api/logto/sign-in',
  signUp: '/api/logto/sign-up',
  callback: '/api/logto/callback',
  signOut: '/api/logto/sign-out',
};

const createTestSessionStorage = (initialData: SessionData = {}) => {
  const sessions = new Map<string, SessionData>([['session-id', structuredClone(initialData)]]);
  const commitSession = vi.fn(async (session: Session) => {
    sessions.set('session-id', structuredClone(session.data));

    return `${sessionCookie}; Path=/; HttpOnly`;
  });
  const destroySession = vi.fn(async () => {
    sessions.delete('session-id');

    return 'logto-session=; Max-Age=0; Path=/';
  });
  const sessionStorage: SessionStorage = {
    getSession: async () =>
      createSession(structuredClone(sessions.get('session-id') ?? {}), 'session-id'),
    commitSession,
    destroySession,
  };

  return {
    sessionStorage,
    commitSession,
    destroySession,
    getData: () => structuredClone(sessions.get('session-id') ?? {}),
  };
};

type ClientSpies = Readonly<{
  signIn: ReturnType<typeof vi.fn<(options: SignInOptions) => Promise<void>>>;
  handleSignInCallback: ReturnType<typeof vi.fn<(callbackUri: string) => Promise<void>>>;
  signOut: ReturnType<typeof vi.fn<(postLogoutRedirectUri?: string) => Promise<void>>>;
}>;

type RequestRuntimeOptions = Readonly<{
  paths?: AuthRoutePaths;
  validateActionRequest?: ValidateAuthActionRequest;
  postCallbackRedirectUri?: string | ResolvePostCallbackRedirectUri;
}>;

const createRequestRuntime = async (
  sessionStorage: SessionStorage,
  options: RequestRuntimeOptions = {}
) => {
  const requestRuntimeContext = createContext<LogtoAuthRequestRuntime>();
  const sessionRuntime = await SessionRuntime.create({
    cookieHeader: sessionCookie,
    sessionStorage,
    sessionCoordinator: createProcessLocalSessionCoordinator(),
  });
  const signIn = vi.fn<(options: SignInOptions) => Promise<void>>();
  const handleSignInCallback = vi.fn<(callbackUri: string) => Promise<void>>();
  const signOut = vi.fn<(postLogoutRedirectUri?: string) => Promise<void>>();
  const createClient: CreateLogtoAuthClient = (session, navigate) => {
    const client: LogtoAuthClient = {
      signIn: async (options) => {
        await signIn(options);
        session.set('signInSession', JSON.stringify(options));

        if (options.postRedirectUri) {
          session.set('postRedirectUri', options.postRedirectUri.toString());
        }

        navigate?.('https://logto.example.com/oidc/auth');
      },
      handleSignInCallback: async (callbackUri) => {
        await handleSignInCallback(callbackUri);
        const postRedirectUri: unknown = session.get('postRedirectUri');

        session.set('idToken', 'id-token');
        session.set('refreshToken', 'refresh-token');
        session.unset('postRedirectUri');

        if (typeof postRedirectUri === 'string') {
          navigate?.(postRedirectUri);
        }
      },
      signOut: async (postLogoutRedirectUri) => {
        await signOut(postLogoutRedirectUri);
        navigate?.('https://logto.example.com/oidc/session/end');
      },
    };

    return client;
  };
  const context = new ContextProvider();

  context.set(requestRuntimeContext, { sessionRuntime, createClient });

  const routes = createAuthRoutes({ baseUrl, requestRuntimeContext })({
    paths: options.paths ?? paths,
    postCallbackRedirectUri: options.postCallbackRedirectUri ?? '/auth/provision',
    postSignOutRedirectUri: '/',
    ...(options.validateActionRequest && {
      validateActionRequest: options.validateActionRequest,
    }),
  });

  return {
    context,
    routes,
    sessionRuntime,
    spies: { signIn, handleSignInCallback, signOut } satisfies ClientSpies,
  };
};

describe('auth-routes:createAuthRoutes', () => {
  it('starts sign-in and commits the sign-in session before redirecting', async () => {
    const store = createTestSessionStorage();
    const { context, routes, spies } = await createRequestRuntime(store.sessionStorage);
    const response = await routes.action({
      request: new Request(`${baseUrl}${paths.signIn}.data`, { method: 'POST' }),
      context,
      url: new URL(`${baseUrl}${paths.signIn}`),
    });

    expect(spies.signIn).toHaveBeenCalledWith({
      redirectUri: `${baseUrl}${paths.callback}`,
      postRedirectUri: `${baseUrl}/auth/provision`,
    });
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://logto.example.com/oidc/auth');
    expect(store.getData()).toHaveProperty('signInSession');
    expect(store.commitSession).toHaveBeenCalledOnce();
  });

  it('starts sign-up on the registration screen', async () => {
    const store = createTestSessionStorage();
    const { context, routes, spies } = await createRequestRuntime(store.sessionStorage);

    await routes.action({
      request: new Request(`${baseUrl}${paths.signUp}`, { method: 'POST' }),
      context,
      url: new URL(`${baseUrl}${paths.signUp}`),
    });

    expect(spies.signIn).toHaveBeenCalledWith({
      redirectUri: `${baseUrl}${paths.callback}`,
      postRedirectUri: `${baseUrl}/auth/provision`,
      firstScreen: 'register',
    });
  });

  it('uses a resolved same-origin return path after the callback', async () => {
    const store = createTestSessionStorage();
    const resolvePostCallbackRedirectUri = vi.fn(
      (signInRequest: Request) =>
        new URL(signInRequest.url).searchParams.get('returnTo') ?? '/auth/provision'
    );
    const signInRuntime = await createRequestRuntime(store.sessionStorage, {
      postCallbackRedirectUri: resolvePostCallbackRedirectUri,
    });
    const signInRequest = new Request(`${baseUrl}${paths.signIn}?returnTo=/tasks/123`, {
      method: 'POST',
    });

    await signInRuntime.routes.action({
      request: signInRequest,
      context: signInRuntime.context,
      url: new URL(signInRequest.url),
    });

    expect(resolvePostCallbackRedirectUri).toHaveBeenCalledWith(signInRequest);
    expect(signInRuntime.spies.signIn).toHaveBeenCalledWith({
      redirectUri: `${baseUrl}${paths.callback}`,
      postRedirectUri: `${baseUrl}/tasks/123`,
    });

    const callbackRuntime = await createRequestRuntime(store.sessionStorage);
    const response = await callbackRuntime.routes.loader({
      request: new Request(`${baseUrl}${paths.callback}?code=code&state=state`),
      context: callbackRuntime.context,
      url: new URL(`${baseUrl}${paths.callback}?code=code&state=state`),
    });

    expect(response.headers.get('Location')).toBe(`${baseUrl}/tasks/123`);
  });

  it('rejects invalid resolver output', async () => {
    const store = createTestSessionStorage();
    const { context, routes, spies } = await createRequestRuntime(store.sessionStorage, {
      postCallbackRedirectUri: () => '//attacker.example.com',
    });

    await expect(
      routes.action({
        request: new Request(`${baseUrl}${paths.signIn}`, { method: 'POST' }),
        context,
        url: new URL(`${baseUrl}${paths.signIn}`),
      })
    ).rejects.toThrow(
      'The resolved post-callback redirect URI must be a same-origin path beginning with "/".'
    );
    expect(spies.signIn).not.toHaveBeenCalled();
    expect(store.commitSession).not.toHaveBeenCalled();
  });

  it('commits callback tokens before redirecting to the post-callback route', async () => {
    const store = createTestSessionStorage({
      signInSession: 'pending',
      postRedirectUri: `${baseUrl}/auth/provision`,
    });
    const { context, routes, spies } = await createRequestRuntime(store.sessionStorage);
    const response = await routes.loader({
      request: new Request(`http://internal.example.com${paths.callback}?code=code&state=state`),
      context,
      url: new URL(`${baseUrl}${paths.callback}?code=code&state=state`),
    });

    expect(spies.handleSignInCallback).toHaveBeenCalledWith(
      `${baseUrl}${paths.callback}?code=code&state=state`
    );
    expect(store.getData()).toMatchObject({
      idToken: 'id-token',
      refreshToken: 'refresh-token',
    });
    expect(store.commitSession).toHaveBeenCalledOnce();
    expect(response.headers.get('Location')).toBe(`${baseUrl}/auth/provision`);
  });

  it('redirects to the application root when the callback has no stored destination', async () => {
    const store = createTestSessionStorage({ signInSession: 'pending' });
    const { context, routes } = await createRequestRuntime(store.sessionStorage);
    const response = await routes.loader({
      request: new Request(`${baseUrl}${paths.callback}?code=code&state=state`),
      context,
      url: new URL(`${baseUrl}${paths.callback}?code=code&state=state`),
    });

    expect(response.headers.get('Location')).toBe(`${baseUrl}/`);
  });

  it('destroys the session before redirecting to Logto sign-out', async () => {
    const store = createTestSessionStorage({ idToken: 'id-token' });
    const { context, routes, sessionRuntime, spies } = await createRequestRuntime(
      store.sessionStorage
    );
    const response = await routes.action({
      request: new Request(`${baseUrl}${paths.signOut}`, { method: 'POST' }),
      context,
      url: new URL(`${baseUrl}${paths.signOut}`),
    });

    expect(spies.signOut).toHaveBeenCalledWith(`${baseUrl}/`);
    expect(store.destroySession).toHaveBeenCalledOnce();
    expect(store.getData()).toEqual({});
    expect(sessionRuntime.getResponseCookieHeader()).toBe('logto-session=; Max-Age=0; Path=/');
    expect(response.headers.get('Location')).toBe('https://logto.example.com/oidc/session/end');
  });

  it.each([
    ['GET sign-in', ['loader', 'GET', paths.signIn, 405, 'POST']],
    ['GET sign-up', ['loader', 'GET', paths.signUp, 405, 'POST']],
    ['GET sign-out', ['loader', 'GET', paths.signOut, 405, 'POST']],
    ['POST callback', ['action', 'POST', paths.callback, 405, 'GET']],
    ['DELETE sign-in', ['action', 'DELETE', paths.signIn, 405, 'POST']],
    ['GET unknown route', ['loader', 'GET', '/not-an-auth-route', 404, null]],
    ['POST unknown route', ['action', 'POST', '/not-an-auth-route', 404, null]],
  ] as const)(
    'returns the expected boundary response for %s',
    async (_name, [handler, method, path, status, allow]) => {
      const store = createTestSessionStorage();
      const { context, routes } = await createRequestRuntime(store.sessionStorage);
      const response = await routes[handler]({
        request: new Request(`${baseUrl}${path}`, { method }),
        context,
        url: new URL(`${baseUrl}${path}`),
      });

      expect(response.status).toBe(status);
      expect(response.headers.get('Allow')).toBe(allow);
    }
  );

  it('validates action requests before mutating the session', async () => {
    const store = createTestSessionStorage();
    const forbidden = new Response(null, { status: 403 });
    const validateActionRequest = vi.fn(() => forbidden);
    const { context, routes, spies } = await createRequestRuntime(store.sessionStorage, {
      validateActionRequest,
    });
    const request = new Request(`${baseUrl}${paths.signIn}`, { method: 'POST' });

    await expect(
      routes.action({ request, context, url: new URL(`${baseUrl}${paths.signIn}`) })
    ).resolves.toBe(forbidden);
    expect(validateActionRequest).toHaveBeenCalledOnce();
    expect(validateActionRequest).toHaveBeenCalledWith(expect.any(Request));
    expect(spies.signIn).not.toHaveBeenCalled();
    expect(store.commitSession).not.toHaveBeenCalled();
  });

  it('allows the sign-up route to be omitted', async () => {
    const store = createTestSessionStorage();
    const { context, routes } = await createRequestRuntime(store.sessionStorage, {
      paths: {
        signIn: paths.signIn,
        callback: paths.callback,
        signOut: paths.signOut,
      },
    });

    const response = await routes.action({
      request: new Request(`${baseUrl}${paths.signUp}`, { method: 'POST' }),
      context,
      url: new URL(`${baseUrl}${paths.signUp}`),
    });

    expect(response.status).toBe(404);
  });
});
