import type { NextApiResponse } from 'next';
import { testApiHandler } from 'next-test-api-route-handler';

import LogtoClient from './index.js';
import type { LogtoNextConfig } from './types.js';

const signInUrl = 'http://mock-logto-server.com/sign-in';

const configs: LogtoNextConfig = {
  appId: 'app_id_value',
  endpoint: 'https://logto.dev',
  baseUrl: 'http://localhost:3000',
  cookieSecret: 'complex_password_at_least_32_characters_long',
  cookieSecure: process.env.NODE_ENV === 'production',
};

const save = vi.fn();
const signIn = vi.fn();
const handleSignInCallback = vi.fn();
const getIdTokenClaims = vi.fn(() => ({
  sub: 'user_id',
}));
const signOut = vi.fn();
const getContext = vi.fn(async () => true);

const mockResponse = (_: unknown, response: NextApiResponse) => {
  response.status(200).end();
};

type Adapter = {
  navigate: (url: string) => void;
};

vi.mock('@logto/node', async (importOriginal) => ({
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  ...(await importOriginal<typeof import('@logto/node')>()),
  // https://stackoverflow.com/a/70705719/12514940
  __esModule: true,
  default: vi.fn((_: unknown, { navigate }: Adapter) => ({
    signIn: (_redirectUri: string, interactionMode?: string) => {
      navigate(interactionMode ? `${signInUrl}?interactionMode=${interactionMode}` : signInUrl);
      signIn();
    },
    handleSignInCallback,
    getContext,
    getIdTokenClaims,
    signOut: () => {
      navigate(configs.baseUrl);
      signOut();
    },
    isAuthenticated: true,
  })),
}));

describe('Next', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates an instance without crash', () => {
    expect(() => new LogtoClient(configs)).not.toThrow();
  });

  describe('handleSignIn', () => {
    it('should redirect to Logto sign in url and save session', async () => {
      const client = new LogtoClient(configs);
      await testApiHandler({
        pagesHandler: client.handleSignIn(),
        url: '/api/logto/sign-in',
        test: async ({ fetch }) => {
          const { headers } = await fetch({ method: 'GET', redirect: 'manual' });
          expect(headers.get('location')).toEqual(signInUrl);
        },
      });
      expect(signIn).toHaveBeenCalled();
    });

    it('should redirect to Logto sign in url with interactionMode and save session', async () => {
      const client = new LogtoClient(configs);
      await testApiHandler({
        pagesHandler: client.handleSignIn(undefined, 'signUp'),
        url: '/api/logto/sign-in',
        test: async ({ fetch }) => {
          const { headers } = await fetch({ method: 'GET', redirect: 'manual' });
          expect(headers.get('location')).toEqual(`${signInUrl}?interactionMode=signUp`);
        },
      });
      expect(signIn).toHaveBeenCalled();
    });
  });

  describe('handleSignInCallback', () => {
    it('should call client.handleSignInCallback and redirect to home', async () => {
      const client = new LogtoClient(configs);
      await testApiHandler({
        pagesHandler: client.handleSignInCallback(),
        url: '/api/logto/sign-in-callback',
        test: async ({ fetch }) => {
          const { headers } = await fetch({ method: 'GET', redirect: 'manual' });
          expect(headers.get('location')).toEqual(configs.baseUrl);
        },
      });
      expect(handleSignInCallback).toHaveBeenCalled();
    });
  });

  describe('withLogtoApiRoute', () => {
    it('should assign `user` to `request`', async () => {
      const client = new LogtoClient(configs);
      await testApiHandler({
        pagesHandler: client.withLogtoApiRoute((request, response) => {
          expect(request.user).toBeDefined();
          response.end();
        }),
        test: async ({ fetch }) => {
          await fetch({ method: 'GET', redirect: 'manual' });
        },
      });
      expect(getContext).toHaveBeenCalled();
    });

    it('custom error handler', async () => {
      getContext.mockRejectedValueOnce(new Error('error'));
      const client = new LogtoClient(configs);
      await testApiHandler({
        pagesHandler: client.withLogtoApiRoute(
          (request, response) => {
            expect(request.user).toBeDefined();
            response.end();
          },
          undefined,
          (request, response, error) => {
            response.send(error instanceof Error ? error.message : 'unknown error');
          }
        ),
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET', redirect: 'manual' });
          await expect(response.text()).resolves.toBe('error');
        },
      });
      expect(getContext).toHaveBeenCalled();
    });
  });

  describe('handleSignOut', () => {
    it('should redirect to Logto sign out url', async () => {
      const client = new LogtoClient(configs);
      await testApiHandler({
        pagesHandler: client.handleSignOut(),
        url: '/api/logto/sign-out',
        test: async ({ fetch }) => {
          const { headers } = await fetch({ method: 'GET', redirect: 'manual' });
          expect(headers.get('location')).toEqual(configs.baseUrl);
        },
      });
      expect(signOut).toHaveBeenCalled();
    });
  });

  describe('handleAuthRoutes', () => {
    it('should call handleSignIn for "sign-in"', async () => {
      const client = new LogtoClient(configs);
      vi.spyOn(client, 'handleSignIn').mockImplementation(() => mockResponse);
      await testApiHandler({
        pagesHandler: client.handleAuthRoutes(),
        paramsPatcher: (parameters) => {
          // eslint-disable-next-line @silverhand/fp/no-mutation
          parameters.action = 'sign-in';
        },
        test: async ({ fetch }) => {
          await fetch({ method: 'GET', redirect: 'manual' });
          expect(client.handleSignIn).toHaveBeenCalled();
        },
      });
    });

    it('should call handleSignIn for "sign-up"', async () => {
      const client = new LogtoClient(configs);
      vi.spyOn(client, 'handleSignIn').mockImplementation(() => mockResponse);
      await testApiHandler({
        pagesHandler: client.handleAuthRoutes(),
        paramsPatcher: (parameters) => {
          // eslint-disable-next-line @silverhand/fp/no-mutation
          parameters.action = 'sign-up';
        },
        test: async ({ fetch }) => {
          await fetch({ method: 'GET', redirect: 'manual' });
          expect(client.handleSignIn).toHaveBeenCalledWith(undefined, 'signUp', undefined);
        },
      });
    });

    it('should call handleSignInCallback for "sign-in-callback"', async () => {
      const client = new LogtoClient(configs);
      vi.spyOn(client, 'handleSignInCallback').mockImplementation(() => mockResponse);
      await testApiHandler({
        pagesHandler: client.handleAuthRoutes(),
        paramsPatcher: (parameters) => {
          // eslint-disable-next-line @silverhand/fp/no-mutation
          parameters.action = 'sign-in-callback';
        },
        test: async ({ fetch }) => {
          await fetch({ method: 'GET', redirect: 'manual' });
          expect(client.handleSignInCallback).toHaveBeenCalled();
        },
      });
    });

    it('should call handleSignOut for "sign-out"', async () => {
      const client = new LogtoClient(configs);
      vi.spyOn(client, 'handleSignOut').mockImplementation(() => mockResponse);
      await testApiHandler({
        pagesHandler: client.handleAuthRoutes(),
        paramsPatcher: (parameters) => {
          // eslint-disable-next-line @silverhand/fp/no-mutation
          parameters.action = 'sign-out';
        },
        test: async ({ fetch }) => {
          await fetch({ method: 'GET', redirect: 'manual' });
          expect(client.handleSignOut).toHaveBeenCalled();
        },
      });
    });

    it('should call handleUser for "user"', async () => {
      const client = new LogtoClient(configs);
      vi.spyOn(client, 'handleUser').mockImplementation(() => mockResponse);
      await testApiHandler({
        pagesHandler: client.handleAuthRoutes(),
        paramsPatcher: (parameters) => {
          // eslint-disable-next-line @silverhand/fp/no-mutation
          parameters.action = 'user';
        },
        test: async ({ fetch }) => {
          await fetch({ method: 'GET', redirect: 'manual' });
          expect(client.handleUser).toHaveBeenCalled();
        },
      });
    });
  });

  describe('createNodeClientFromNextApi', () => {
    it('should get node client without crash', async () => {
      const client = new LogtoClient(configs);
      await testApiHandler({
        pagesHandler: async (request, response) => {
          await client.createNodeClientFromNextApi(request, response);
          response.end();
        },
        test: async ({ fetch }) => {
          await expect(fetch({ method: 'GET' })).resolves.not.toThrow();
        },
      });
    });
  });
});
