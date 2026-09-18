import { Prompt, type SignInOptions } from '@logto/node';
import type { ErrorRequestHandler } from 'express';

import { handleAuthRoutes, withLogto } from './index.js';
import { testMiddleware, testRouter } from './test-utils.js';
import type { GetSignInOptions, LogtoExpressConfig } from './types.js';

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
const signIn = vi.fn<(options: SignInOptions) => void>();
const handleSignInCallback = vi.fn();
const getIdTokenClaims = vi.fn(() => ({
  sub: 'user_id',
}));
const signOut = vi.fn();
const getContext = vi.fn(async () => ({ isAuthenticated: true }));

vi.mock('./storage', () => ({
  default: vi.fn(function () {
    return {
      setItem,
      getItem,
      removeItem: vi.fn(),
    };
  }),
}));

type Adapter = {
  navigate: (url: string) => void;
};

vi.mock('@logto/node', async (importOriginal) => ({
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  ...(await importOriginal<typeof import('@logto/node')>()),
  default: vi.fn(function (_: unknown, { navigate }: Adapter) {
    return {
      signIn: (options: SignInOptions) => {
        navigate(
          options.firstScreen === 'register' ? `${signInUrl}?firstScreen=register` : signInUrl
        );
        signIn(options);
      },
      handleSignInCallback,
      getContext,
      getIdTokenClaims,
      signOut: () => {
        navigate(configs.baseUrl);
        signOut();
      },
      isAuthenticated: true,
    };
  }),
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
        await Promise.resolve(
          testRouter(handleAuthRoutes(configs)).get('/logto/sign-in').expect('Location', signInUrl)
        );

        expect(signIn).toHaveBeenCalled();
      });

      it('should support custom auth routes prefix', async () => {
        await Promise.resolve(
          testRouter(handleAuthRoutes({ ...configs, authRoutesPrefix: 'custom' }))
            .get('/custom/sign-in')
            .expect('Location', signInUrl)
        );

        expect(signIn).toHaveBeenCalled();
      });

      it('should merge request-specific options over static defaults', async () => {
        const getSignInOptions = vi.fn<GetSignInOptions>((request) => ({
          prompt: request.query.prompt === 'consent' ? Prompt.Consent : Prompt.Login,
          extraParams: { source: 'request' },
        }));

        await Promise.resolve(
          testRouter(
            handleAuthRoutes(
              {
                ...configs,
                signInOptions: { prompt: Prompt.Login, extraParams: { source: 'static' } },
              },
              { getSignInOptions }
            )
          )
            .get('/logto/sign-in?prompt=consent')
            .expect('Location', signInUrl)
        );

        expect(getSignInOptions).toHaveBeenCalledWith(expect.anything(), 'signIn');
        expect(signIn).toHaveBeenCalledWith({
          prompt: 'consent',
          extraParams: { source: 'request' },
          redirectUri: `${configs.baseUrl}/logto/sign-in-callback`,
        });
      });

      it('should forward request-specific option errors to Express error middleware', async () => {
        const resolverError = new Error('failed to resolve sign-in options');
        const errorHandler = vi.fn<ErrorRequestHandler>((error, _request, response, _next) => {
          expect(error).toBe(resolverError);
          response.status(503).end();
        });

        await Promise.resolve(
          testRouter(
            handleAuthRoutes(configs, {
              getSignInOptions: async () => {
                throw resolverError;
              },
            }),
            errorHandler
          )
            .get('/logto/sign-in')
            .expect(503)
        );

        expect(errorHandler).toHaveBeenCalledOnce();
      });
    });

    describe('handleSignUp', () => {
      it('should redirect to the registration screen and save session', async () => {
        await Promise.resolve(
          testRouter(handleAuthRoutes(configs))
            .get('/logto/sign-up')
            .expect('Location', `${signInUrl}?firstScreen=register`)
        );

        expect(signIn).toHaveBeenCalledWith({
          redirectUri: `${configs.baseUrl}/logto/sign-in-callback`,
          firstScreen: 'register',
        });
      });

      it('should keep the registration screen authoritative', async () => {
        await Promise.resolve(
          testRouter(
            handleAuthRoutes(configs, {
              getSignInOptions: () => ({ firstScreen: 'signIn' }),
            })
          )
            .get('/logto/sign-up')
            .expect('Location', `${signInUrl}?firstScreen=register`)
        );

        expect(signIn).toHaveBeenCalledWith({
          firstScreen: 'register',
          redirectUri: `${configs.baseUrl}/logto/sign-in-callback`,
        });
      });
    });

    describe('handleSignInCallback', () => {
      it('should call client.handleSignInCallback and redirect to home page', async () => {
        await Promise.resolve(
          testRouter(handleAuthRoutes(configs))
            .get('/logto/sign-in-callback')
            .expect('Location', configs.baseUrl)
        );

        expect(handleSignInCallback).toHaveBeenCalled();
      });
    });

    describe('handleSignOut', () => {
      it('should redirect to Logto sign out url', async () => {
        await Promise.resolve(
          testRouter(handleAuthRoutes(configs))
            .get('/logto/sign-out')
            .expect('Location', configs.baseUrl)
        );

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
/* eslint-enable max-nested-callbacks */
