import { NextApiResponse } from 'next';
import { testApiHandler } from 'next-test-api-route-handler';

import LogtoClient from '.';
import { LogtoNextConfig } from './types';

const signInUrl = 'http://mock-logto-server.com/sign-in';

const configs: LogtoNextConfig = {
  appId: 'app_id_value',
  endpoint: 'https://logto.dev',
  baseUrl: 'http://localhost:3000',
  cookieSecret: 'complex_password_at_least_32_characters_long',
  cookieSecure: process.env.NODE_ENV === 'production',
};

const setItem = jest.fn((key, value) => {
  console.log(key, value);
});
const getItem = jest.fn();
const save = jest.fn();
const signIn = jest.fn();
const handleSignInCallback = jest.fn();
const getIdTokenClaims = jest.fn(() => ({
  sub: 'user_id',
}));
const signOut = jest.fn();
const getAccessToken = jest.fn(async () => true);

const mockResponse = (_: unknown, response: NextApiResponse) => {
  response.status(200).end();
};

jest.mock('./storage', () =>
  jest.fn(() => ({
    setItem,
    getItem,
    removeItem: jest.fn(),
    save: () => {
      save();
    },
  }))
);

type Adapter = {
  navigate: (url: string) => void;
};

jest.mock('@logto/node', () =>
  jest.fn((_: unknown, { navigate }: Adapter) => ({
    signIn: () => {
      navigate(signInUrl);
      signIn();
    },
    handleSignInCallback,
    getAccessToken,
    getIdTokenClaims,
    signOut: () => {
      navigate(configs.baseUrl);
      signOut();
    },
    isAuthenticated: true,
  }))
);

describe('Next', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates an instance without crash', () => {
    expect(() => new LogtoClient(configs)).not.toThrow();
  });

  describe('handleSignIn', () => {
    it('should redirect to Logto sign in url and save session', async () => {
      const client = new LogtoClient(configs);
      await testApiHandler({
        handler: client.handleSignIn(),
        url: '/api/logto/sign-in',
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET', redirect: 'manual' });
          const headers = response.headers as Map<string, string>;
          expect(headers.get('location')).toEqual(signInUrl);
        },
      });
      expect(save).toHaveBeenCalled();
      expect(signIn).toHaveBeenCalled();
    });
  });

  describe('handleSignInCallback', () => {
    it('should call client.handleSignInCallback and redirect to home', async () => {
      const client = new LogtoClient(configs);
      await testApiHandler({
        handler: client.handleSignInCallback(),
        url: '/api/logto/sign-in-callback',
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET', redirect: 'manual' });
          const headers = response.headers as Map<string, string>;
          expect(headers.get('location')).toEqual(`${configs.baseUrl}/`);
        },
      });
      expect(handleSignInCallback).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
    });
  });

  describe('withLogtoApiRoute', () => {
    it('should set isAuthenticated to false when "getAccessToken" is enabled and is unable to getAccessToken', async () => {
      getAccessToken.mockRejectedValueOnce(new Error('Unauthorized'));
      const client = new LogtoClient(configs);
      await testApiHandler({
        handler: client.withLogtoApiRoute(
          (request, response) => {
            expect(request.user).toBeDefined();
            response.json(request.user);
          },
          { getAccessToken: true }
        ),
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET', redirect: 'manual' });
          await expect(response.json()).resolves.toEqual({ isAuthenticated: false });
        },
      });
      expect(getAccessToken).toHaveBeenCalled();
    });

    it('should assign `user` to `request` and not call getAccessToken by default', async () => {
      const client = new LogtoClient(configs);
      await testApiHandler({
        handler: client.withLogtoApiRoute((request, response) => {
          expect(request.user).toBeDefined();
          response.end();
        }),
        test: async ({ fetch }) => {
          await fetch({ method: 'GET', redirect: 'manual' });
        },
      });
      expect(getIdTokenClaims).toHaveBeenCalled();
      expect(getAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('handleSignOut', () => {
    it('should redirect to Logto sign out url', async () => {
      const client = new LogtoClient(configs);
      await testApiHandler({
        handler: client.handleSignOut(),
        url: '/api/logto/sign-out',
        test: async ({ fetch }) => {
          const response = await fetch({ method: 'GET', redirect: 'manual' });
          const headers = response.headers as Map<string, string>;
          expect(headers.get('location')).toEqual(`${configs.baseUrl}/`);
        },
      });
      expect(save).toHaveBeenCalled();
      expect(signOut).toHaveBeenCalled();
    });
  });

  describe('handleAuthRoutes', () => {
    it('should call handleSignIn for "sign-in"', async () => {
      const client = new LogtoClient(configs);
      jest.spyOn(client, 'handleSignIn').mockImplementation(() => mockResponse);
      await testApiHandler({
        handler: client.handleAuthRoutes(),
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

    it('should call handleSignInCallback for "sign-in-callback"', async () => {
      const client = new LogtoClient(configs);
      jest.spyOn(client, 'handleSignInCallback').mockImplementation(() => mockResponse);
      await testApiHandler({
        handler: client.handleAuthRoutes(),
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
      jest.spyOn(client, 'handleSignOut').mockImplementation(() => mockResponse);
      await testApiHandler({
        handler: client.handleAuthRoutes(),
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
      jest.spyOn(client, 'handleUser').mockImplementation(() => mockResponse);
      await testApiHandler({
        handler: client.handleAuthRoutes(),
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
});
