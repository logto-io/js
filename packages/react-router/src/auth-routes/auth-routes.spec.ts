import type { SignInOptions } from '@logto/node';
import type { Session, SessionData, SessionStorage } from 'react-router';
import {
  createContext,
  createSession,
  RouterContextProvider as ContextProvider,
} from 'react-router';

import { createProcessLocalSessionCoordinator } from '../infrastructure/session/index.js';
import { SessionRuntime } from '../infrastructure/session/session-runtime.js';

import type { AuthRoutePaths, ValidateAuthActionRequest } from './auth-routes.js';
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

        navigate?.('https://logto.example.com/oidc/auth');
      },
      handleSignInCallback: async (callbackUri) => {
        await handleSignInCallback(callbackUri);

        session.set('idToken', 'id-token');
        session.set('refreshToken', 'refresh-token');
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
    postCallbackRedirectUri: '/auth/provision',
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
    });
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://logto.example.com/oidc/auth');
    expect(store.getData()).toHaveProperty('signInSession');
    expect(store.commitSession).toHaveBeenCalledOnce();
  });

  it('uses the unstable normalized URL for data requests', async () => {
    const store = createTestSessionStorage();
    const { context, routes, spies } = await createRequestRuntime(store.sessionStorage);
    const response = await routes.action({
      request: new Request(`${baseUrl}${paths.signIn}.data`, { method: 'POST' }),
      context,
      unstable_url: new URL(`${baseUrl}${paths.signIn}`),
    });

    expect(spies.signIn).toHaveBeenCalledWith({
      redirectUri: `${baseUrl}${paths.callback}`,
    });
    expect(response.headers.get('Location')).toBe('https://logto.example.com/oidc/auth');
  });

  it('starts sign-up on the registration screen', async () => {
    const store = createTestSessionStorage();
    const { context, routes, spies } = await createRequestRuntime(store.sessionStorage);

    await routes.action({
      request: new Request(`${baseUrl}${paths.signUp}`, { method: 'POST' }),
      context,
    });

    expect(spies.signIn).toHaveBeenCalledWith({
      redirectUri: `${baseUrl}${paths.callback}`,
      firstScreen: 'register',
    });
  });

  it('commits callback tokens before redirecting to the post-callback route', async () => {
    const store = createTestSessionStorage({ signInSession: 'pending' });
    const { context, routes, spies } = await createRequestRuntime(store.sessionStorage);
    const response = await routes.loader({
      request: new Request(`http://internal.example.com${paths.callback}?code=code&state=state`),
      context,
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

  it('destroys the session before redirecting to Logto sign-out', async () => {
    const store = createTestSessionStorage({ idToken: 'id-token' });
    const { context, routes, sessionRuntime, spies } = await createRequestRuntime(
      store.sessionStorage
    );
    const response = await routes.action({
      request: new Request(`${baseUrl}${paths.signOut}`, { method: 'POST' }),
      context,
    });

    expect(spies.signOut).toHaveBeenCalledWith(`${baseUrl}/`);
    expect(store.destroySession).toHaveBeenCalledOnce();
    expect(store.getData()).toEqual({});
    expect(sessionRuntime.getResponseCookieHeader()).toBe('logto-session=; Max-Age=0; Path=/');
    expect(response.headers.get('Location')).toBe('https://logto.example.com/oidc/session/end');
  });

  it.each([
    ['sign-in', paths.signIn],
    ['sign-up', paths.signUp],
    ['sign-out', paths.signOut],
  ])('rejects GET requests to the %s action route', async (_name, path) => {
    const store = createTestSessionStorage();
    const { context, routes, spies } = await createRequestRuntime(store.sessionStorage);
    const response = await routes.loader({
      request: new Request(`${baseUrl}${path}`),
      context,
    });

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
    expect(spies.signIn).not.toHaveBeenCalled();
    expect(spies.signOut).not.toHaveBeenCalled();
  });

  it('rejects POST requests to the callback route', async () => {
    const store = createTestSessionStorage({ signInSession: 'pending' });
    const { context, routes, spies } = await createRequestRuntime(store.sessionStorage);
    const response = await routes.action({
      request: new Request(`${baseUrl}${paths.callback}`, { method: 'POST' }),
      context,
    });

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET');
    expect(spies.handleSignInCallback).not.toHaveBeenCalled();
  });

  it('rejects non-POST methods on action routes', async () => {
    const store = createTestSessionStorage();
    const { context, routes, spies } = await createRequestRuntime(store.sessionStorage);
    const response = await routes.action({
      request: new Request(`${baseUrl}${paths.signIn}`, { method: 'DELETE' }),
      context,
    });

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
    expect(spies.signIn).not.toHaveBeenCalled();
  });

  it('validates action requests before mutating the session', async () => {
    const store = createTestSessionStorage();
    const forbidden = new Response(null, { status: 403 });
    const validateActionRequest = vi.fn(() => forbidden);
    const { context, routes, spies } = await createRequestRuntime(store.sessionStorage, {
      validateActionRequest,
    });
    const request = new Request(`${baseUrl}${paths.signIn}`, { method: 'POST' });

    await expect(routes.action({ request, context })).resolves.toBe(forbidden);
    expect(validateActionRequest).toHaveBeenCalledOnce();
    expect(validateActionRequest).toHaveBeenCalledWith(expect.any(Request));
    expect(spies.signIn).not.toHaveBeenCalled();
    expect(store.commitSession).not.toHaveBeenCalled();
  });

  it('returns 404 for paths that are not configured as authentication routes', async () => {
    const store = createTestSessionStorage();
    const { context, routes } = await createRequestRuntime(store.sessionStorage);

    const loaderResponse = await routes.loader({
      request: new Request(`${baseUrl}/not-an-auth-route`),
      context,
    });
    const actionResponse = await routes.action({
      request: new Request(`${baseUrl}/not-an-auth-route`, { method: 'POST' }),
      context,
    });

    expect(loaderResponse.status).toBe(404);
    expect(actionResponse.status).toBe(404);
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
    });

    expect(response.status).toBe(404);
  });
});
