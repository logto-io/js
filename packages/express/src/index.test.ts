import { handleAuthRoutes, withLogto } from './index.js';
import { testMiddleware, testRouter } from './test-utils.js';
import type { LogtoExpressConfig } from './types.js';

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
const getContext = jest.fn(async () => ({ isAuthenticated: true }));

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
    signIn: (_redirectUri?: string, interactionMode?: string) => {
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
  }))
);

describe('Express', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleAuthRoutes', () => {
    describe('handleSignIn', () => {
      it('should redirect to Logto sign in url and save session', async () => {
        const response = await testRouter(handleAuthRoutes(configs)).get('/logto/sign-in');
        expect(response.header.location).toEqual(signInUrl);
        expect(signIn).toHaveBeenCalled();
      });
    });

    describe('handleSignUn', () => {
      it('should redirect to Logto sign in url with signUp interaction mode and save session', async () => {
        const response = await testRouter(handleAuthRoutes(configs)).get('/logto/sign-up');
        expect(response.header.location).toEqual(`${signInUrl}?interactionMode=signUp`);
        expect(signIn).toHaveBeenCalled();
      });
    });

    describe('handleSignInCallback', () => {
      it('should call client.handleSignInCallback and redirect to home page', async () => {
        const response = await testRouter(handleAuthRoutes(configs)).get('/logto/sign-in-callback');
        expect(response.header.location).toEqual(configs.baseUrl);
        expect(handleSignInCallback).toHaveBeenCalled();
      });
    });

    describe('handleSignOut', () => {
      it('should redirect to Logto sign out url', async () => {
        const response = await testRouter(handleAuthRoutes(configs)).get('/logto/sign-out');
        expect(response.header.location).toEqual(configs.baseUrl);
        expect(signOut).toHaveBeenCalled();
      });
    });
  });

  describe('withLogto', () => {
    it('should assign `user` to `request`', async () => {
      await testMiddleware({
        middleware: withLogto(configs),
        test: async ({ request }) => {
          expect(request.user).toBeDefined();
        },
      });
      expect(getContext).toHaveBeenCalled();
    });
  });
});
