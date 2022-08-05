import LogtoClient from '.';
import { testMiddleware } from './test-utils';
import { LogtoExpressConfig } from './types';

const signInUrl = 'http://mock-logto-server.com/sign-in';

const configs: LogtoExpressConfig = {
  appId: 'app_id_value',
  endpoint: 'https://logto.dev',
  baseUrl: 'http://localhost:3000',
};

const setItem = jest.fn((key, value) => {
  console.log(key, value);
});
const getItem = jest.fn();
const signIn = jest.fn();
const handleSignInCallback = jest.fn();
const getIdTokenClaims = jest.fn(() => ({
  sub: 'user_id',
}));
const signOut = jest.fn();
const getAccessToken = jest.fn(async () => true);

jest.mock('./storage', () =>
  jest.fn(() => ({
    setItem,
    getItem,
    removeItem: jest.fn(),
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

describe('Express', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates an instance without crash', () => {
    expect(() => new LogtoClient(configs)).not.toThrow();
  });

  describe('handleSignIn', () => {
    it('should redirect to Logto sign in url and save session', async () => {
      const client = new LogtoClient(configs);
      await testMiddleware({
        middleware: client.handleSignIn(),
        test: async ({ response }) => {
          expect(response.redirect).toHaveBeenCalledWith(signInUrl);
        },
      });
      expect(signIn).toHaveBeenCalled();
    });
  });

  describe('handleSignInCallback', () => {
    it('should call client.handleSignInCallback and redirect to home', async () => {
      const client = new LogtoClient(configs);
      await testMiddleware({
        middleware: client.handleSignInCallback(),
        url: '/api/logto/sign-in-callback',
        test: async ({ response }) => {
          expect(response.redirect).toHaveBeenCalledWith(configs.baseUrl);
        },
      });
      expect(handleSignInCallback).toHaveBeenCalled();
    });
  });

  describe('handleSignOut', () => {
    it('should redirect to Logto sign out url', async () => {
      const client = new LogtoClient(configs);
      await testMiddleware({
        middleware: client.handleSignOut(),
        url: '/api/logto/sign-out',
        test: async ({ response }) => {
          expect(response.redirect).toHaveBeenCalledWith(configs.baseUrl);
        },
      });
      expect(signOut).toHaveBeenCalled();
    });
  });
});
