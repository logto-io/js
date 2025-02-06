import { handleAuthRoutes, withLogto } from './index.js';
import { testMiddleware, testRouter } from './test-utils.js';
import type { LogtoExpressConfig } from './types.js';

const signInUrl = 'http://mock-logto-server.com/sign-in';

const configs: LogtoExpressConfig = {
  appId: 'app_id_value',
  endpoint: 'https://logto.dev',
  baseUrl: 'http://localhost:3000',
};

const setItem = vi.fn((key, value) => {
  console.log(key, value);
});
const getItem = vi.fn();
const signIn = vi.fn();
const handleSignInCallback = vi.fn();
const getIdTokenClaims = vi.fn(() => ({
  sub: 'user_id',
}));
const signOut = vi.fn();
const getContext = vi.fn(async () => ({ isAuthenticated: true }));

/**
 * All the expect function to be called assertions wrapped in the `end` callback
 * in the following test cases are randomly failing under the vitest --coverage mode.
 *
 * So we manually added a delay to wait for the promise to resolve before making the assertions.
 */
const delay = async (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

vi.mock('./storage', () => ({
  default: vi.fn(() => ({
    setItem,
    getItem,
    removeItem: vi.fn(),
  })),
}));

type Adapter = {
  navigate: (url: string) => void;
};

vi.mock('@logto/node', () => ({
  default: vi.fn((_: unknown, { navigate }: Adapter) => ({
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
  })),
}));

// The new version of Supertest use callback chaining instead of promise chaining
/* eslint-disable max-nested-callbacks */
describe('Express', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('handleAuthRoutes', () => {
    describe('handleSignIn', () => {
      it('should redirect to Logto sign in url and save session', async () => {
        testRouter(handleAuthRoutes(configs))
          .get('/logto/sign-in')
          .expect('Location', signInUrl)
          .end(async () => {
            await delay(100);
            expect(signIn).toHaveBeenCalled();
          });
      });

      it('should support custom auth routes prefix', async () => {
        testRouter(handleAuthRoutes({ ...configs, authRoutesPrefix: 'custom' }))
          .get('/logto/sign-in')
          .expect('Location', signInUrl)
          .end(async () => {
            await delay(100);
            expect(signIn).toHaveBeenCalled();
          });
      });
    });

    describe('handleSignUp', () => {
      it('should redirect to Logto sign in url with signUp interaction mode and save session', async () => {
        testRouter(handleAuthRoutes(configs))
          .get('/logto/sign-up')
          .expect('Location', `${signInUrl}?interactionMode=signUp`)
          .end(async () => {
            await delay(100);
            expect(signIn).toHaveBeenCalled();
          });
      });
    });

    describe('handleSignInCallback', () => {
      it('should call client.handleSignInCallback and redirect to home page', async () => {
        testRouter(handleAuthRoutes(configs))
          .get('/logto/sign-in-callback')
          .expect('Location', configs.baseUrl)
          .end(async () => {
            await delay(100);
            expect(handleSignInCallback).toHaveBeenCalled();
          });
      });
    });

    describe('handleSignOut', () => {
      it('should redirect to Logto sign out url', async () => {
        testRouter(handleAuthRoutes(configs))
          .get('/logto/sign-out')
          .expect('Location', configs.baseUrl)
          .end(async () => {
            await delay(100);
            expect(signOut).toHaveBeenCalled();
          });
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
/* eslint-enable max-nested-callbacks */
