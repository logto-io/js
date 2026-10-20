import {
  PersistKey,
  Prompt,
  unwrapSession,
  wrapSession,
  type CookieStorage,
  type GetContextParameters,
  type LogtoContext,
  type SignInOptions,
} from '@logto/node';
import NodeClient from '@logto/node/edge';
import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { handleAuthRoutes, withLogto } from './index.js';
import type { GetSignInOptions, LogtoHonoConfig, LogtoVariables } from './types.js';

const signInUrl = 'http://mock-logto-server.com/sign-in';
const signOutUrl = 'http://mock-logto-server.com/sign-out';

type TestAdapter = {
  navigate: (url: string) => Promise<void> | void;
  storage: CookieStorage;
};

type GetContextMock = (
  parameters: GetContextParameters | undefined,
  storage: CookieStorage
) => Promise<LogtoContext>;

const mocks = vi.hoisted(() => {
  return {
    signIn: vi.fn<(options: SignInOptions) => void>(),
    signOut: vi.fn<(redirectUri?: string) => void>(),
    handleSignInCallback: vi.fn<(url: string) => void>(),
    getContext: vi.fn<GetContextMock>(),
  };
});

vi.mock('@logto/node/edge', () => ({
  default: vi.fn(function (_config: unknown, adapter: TestAdapter) {
    return {
      signIn: async (options: SignInOptions) => {
        await adapter.storage.setItem(PersistKey.SignInSession, 'session');
        await adapter.storage.removeItem(PersistKey.AccessToken);
        await adapter.storage.removeItem(PersistKey.IdToken);
        await adapter.storage.removeItem(PersistKey.RefreshToken);
        await adapter.navigate(
          options.firstScreen === 'register' ? `${signInUrl}?firstScreen=register` : signInUrl
        );
        mocks.signIn(options);
      },
      signOut: async (redirectUri?: string) => {
        await adapter.storage.removeItem(PersistKey.IdToken);
        await adapter.storage.removeItem(PersistKey.RefreshToken);
        await adapter.storage.removeItem(PersistKey.AccessToken);
        await adapter.storage.removeItem(PersistKey.SignInSession);
        await adapter.navigate(signOutUrl);
        mocks.signOut(redirectUri);
      },
      handleSignInCallback: async (url: string) => {
        await adapter.storage.setItem(PersistKey.RefreshToken, 'refresh_token');
        await adapter.storage.setItem(PersistKey.IdToken, 'id_token');
        await adapter.storage.setItem(PersistKey.AccessToken, '{}');
        await adapter.storage.removeItem(PersistKey.SignInSession);
        mocks.handleSignInCallback(url);
      },
      getContext: async (parameters?: GetContextParameters) =>
        mocks.getContext(parameters, adapter.storage),
    };
  }),
}));

const config: LogtoHonoConfig = {
  appId: 'app_id_value',
  endpoint: 'https://logto.dev',
  baseUrl: 'http://localhost:3000',
  encryptionKey: 'encryption-key',
};

const createApp = (appConfig: LogtoHonoConfig) => {
  const app = new Hono<{ Variables: LogtoVariables }>();
  app.route('/', handleAuthRoutes(appConfig));
  return app;
};

const getCookieValue = (response: Response, name = 'logtoCookies') => {
  const cookies = response.headers.getSetCookie();

  expect(cookies).toHaveLength(1);

  const pair = cookies[0]?.split(';')[0];

  if (!pair?.startsWith(`${name}=`)) {
    throw new Error(`Cookie "${name}" is missing`);
  }

  return decodeURIComponent(pair.slice(name.length + 1));
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('handleAuthRoutes', () => {
  describe('sign-in', () => {
    it('should redirect to the Logto sign-in URL and save the session', async () => {
      const response = await createApp(config).request('/logto/sign-in');

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(signInUrl);
      expect(mocks.signIn).toHaveBeenCalledWith({
        redirectUri: `${config.baseUrl}/logto/sign-in-callback`,
      });
      expect(NodeClient).toHaveBeenCalledWith(config, expect.any(Object));

      const session = await unwrapSession(getCookieValue(response), config.encryptionKey);
      expect(session).toEqual({ [PersistKey.SignInSession]: 'session' });
    });

    it('should support a custom auth routes prefix', async () => {
      const response = await createApp({ ...config, authRoutesPrefix: 'custom' }).request(
        '/custom/sign-in'
      );

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(signInUrl);
      expect(mocks.signIn).toHaveBeenCalledWith({
        redirectUri: `${config.baseUrl}/custom/sign-in-callback`,
      });
    });

    it('should resolve request-specific options and let them override static defaults', async () => {
      const getSignInOptions = vi.fn<GetSignInOptions>((context) => ({
        prompt: context.req.query('prompt') === 'consent' ? Prompt.Consent : Prompt.Login,
        extraParams: { source: 'request' },
      }));

      const app = new Hono<{ Variables: LogtoVariables }>();
      app.route(
        '/',
        handleAuthRoutes(
          {
            ...config,
            signInOptions: { prompt: Prompt.Login, extraParams: { source: 'static' } },
          },
          { getSignInOptions }
        )
      );

      const response = await app.request('/logto/sign-in?prompt=consent');

      expect(response.status).toBe(302);
      expect(getSignInOptions).toHaveBeenCalledWith(expect.anything(), 'signIn');
      expect(mocks.signIn).toHaveBeenCalledWith({
        prompt: Prompt.Consent,
        extraParams: { source: 'request' },
        redirectUri: `${config.baseUrl}/logto/sign-in-callback`,
      });
    });

    it('should store the session in a secure, custom-named cookie over HTTPS', async () => {
      const response = await createApp({ ...config, cookieKey: 'custom' }).request(
        '/logto/sign-in',
        { headers: { 'x-forwarded-proto': 'https' } }
      );

      expect(response.headers.getSetCookie()).toHaveLength(1);

      const cookie = response.headers.getSetCookie()[0] ?? '';

      expect(cookie).toMatch(/^custom=/);
      expect(cookie).toContain('Secure');
      expect(cookie).toContain('HttpOnly');
    });

    it('should mark the cookie Secure for a direct HTTPS request', async () => {
      const response = await createApp(config).request('https://localhost:3000/logto/sign-in');

      expect(response.headers.getSetCookie()).toHaveLength(1);

      const cookie = response.headers.getSetCookie()[0] ?? '';

      expect(cookie).toContain('Secure');
    });
  });

  describe('sign-up', () => {
    it('should redirect to the registration screen', async () => {
      const response = await createApp(config).request('/logto/sign-up');

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(`${signInUrl}?firstScreen=register`);
      expect(mocks.signIn).toHaveBeenCalledWith({
        redirectUri: `${config.baseUrl}/logto/sign-in-callback`,
        firstScreen: 'register',
      });
    });

    it('should keep the registration screen authoritative', async () => {
      const getSignInOptions = vi.fn<GetSignInOptions>(() => ({ firstScreen: 'signIn' }));

      const app = new Hono<{ Variables: LogtoVariables }>();
      app.route('/', handleAuthRoutes(config, { getSignInOptions }));

      const response = await app.request('/logto/sign-up');

      expect(response.status).toBe(302);
      expect(getSignInOptions).toHaveBeenCalledWith(expect.anything(), 'signUp');
      expect(mocks.signIn).toHaveBeenCalledWith({
        redirectUri: `${config.baseUrl}/logto/sign-in-callback`,
        firstScreen: 'register',
      });
    });
  });

  describe('sign-in callback', () => {
    it('should handle the callback with the configured base URL and redirect home', async () => {
      const response = await createApp(config).request(
        '/logto/sign-in-callback?code=code&state=state'
      );

      expect(mocks.handleSignInCallback).toHaveBeenCalledWith(
        `${config.baseUrl}/logto/sign-in-callback?code=code&state=state`
      );
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(config.baseUrl);

      const session = await unwrapSession(getCookieValue(response), config.encryptionKey);
      expect(session).toEqual({
        [PersistKey.RefreshToken]: 'refresh_token',
        [PersistKey.IdToken]: 'id_token',
        [PersistKey.AccessToken]: '{}',
      });
    });
  });

  describe('sign-out', () => {
    it('should sign out and redirect to the navigation URL from Logto', async () => {
      const response = await createApp(config).request('/logto/sign-out');

      expect(mocks.signOut).toHaveBeenCalledWith(config.baseUrl);
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(signOutUrl);

      const session = await unwrapSession(getCookieValue(response), config.encryptionKey);
      expect(session).toEqual({});
    });
  });

  it('should return 404 for unknown auth routes', async () => {
    const response = await createApp(config).request('/logto/unknown');

    expect(response.status).toBe(404);
  });
});

describe('withLogto', () => {
  it('should inject the Logto context into `c.var.logto`', async () => {
    const context = { isAuthenticated: true };
    mocks.getContext.mockResolvedValueOnce(context);

    const app = new Hono<{ Variables: LogtoVariables }>();
    app.get('/context', withLogto(config), (request) => request.json(request.var.logto));

    const response = await app.request('/context');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(context);
    expect(mocks.getContext).toHaveBeenCalledWith(
      {
        getAccessToken: undefined,
        resource: undefined,
        fetchUserInfo: undefined,
        getOrganizationToken: undefined,
        organizationId: undefined,
      },
      expect.anything()
    );
  });

  it('should pass the context parameters to the Logto client', async () => {
    mocks.getContext.mockResolvedValueOnce({ isAuthenticated: false });

    const app = new Hono<{ Variables: LogtoVariables }>();
    app.get(
      '/context',
      withLogto({
        ...config,
        getAccessToken: true,
        resource: 'https://api.example.com',
        fetchUserInfo: true,
        getOrganizationToken: true,
        organizationId: 'organization_id',
      }),
      (request) => request.json(request.var.logto)
    );

    await app.request('/context');

    expect(mocks.getContext).toHaveBeenCalledWith(
      {
        getAccessToken: true,
        resource: 'https://api.example.com',
        fetchUserInfo: true,
        getOrganizationToken: true,
        organizationId: 'organization_id',
      },
      expect.anything()
    );
  });

  it('should persist refreshed tokens in a single cookie', async () => {
    mocks.getContext.mockImplementationOnce(async (_parameters, storage) => {
      await storage.setItem(PersistKey.AccessToken, '{}');
      await storage.setItem(PersistKey.RefreshToken, 'refresh_token');

      return { isAuthenticated: true };
    });

    const app = new Hono<{ Variables: LogtoVariables }>();
    app.get('/context', withLogto(config), (request) => request.json(request.var.logto));

    const response = await app.request('/context');
    const session = await unwrapSession(getCookieValue(response), config.encryptionKey);

    expect(session).toEqual({
      [PersistKey.AccessToken]: '{}',
      [PersistKey.RefreshToken]: 'refresh_token',
    });
  });

  it('should read the session from the request cookie', async () => {
    const { encryptionKey } = config;
    const cookie = await wrapSession({ [PersistKey.IdToken]: 'id_token' }, encryptionKey);
    mocks.getContext.mockImplementationOnce(async (_parameters, storage) => ({
      isAuthenticated: (await storage.getItem(PersistKey.IdToken)) === 'id_token',
    }));

    const app = new Hono<{ Variables: LogtoVariables }>();
    app.get('/context', withLogto({ ...config, encryptionKey }), (request) =>
      request.json(request.var.logto)
    );

    const response = await app.request('/context', {
      headers: { cookie: `logtoCookies=${cookie}` },
    });

    expect(await response.json()).toEqual({ isAuthenticated: true });
  });
});
