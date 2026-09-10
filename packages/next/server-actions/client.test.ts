import { type LogtoNextConfig } from '../src/types.js';

import LogtoClient from './client.js';

const signInUrl = 'http://mock-logto-server.com/sign-in';
const callbackUrl = 'http://localhost:3000/callback';
const postRedirectUri = 'http://localhost:3000/dashboard';

const configs: LogtoNextConfig = {
  appId: 'app_id_value',
  endpoint: 'https://logto.dev',
  baseUrl: 'http://localhost:3000',
  cookieSecret: 'secret',
  cookieSecure: false,
};

const signIn = vi.fn();
const handleSignInCallback = vi.fn();
const getIdTokenClaims = vi.fn(() => ({
  sub: 'user_id',
}));
const signOut = vi.fn();
const getContext = vi.fn(async () => ({ isAuthenticated: true }));
const destroy = vi.fn();

vi.mock('@logto/node', () => ({
  CookieStorage: vi.fn((_, cookie: string) => {
    return {
      init: vi.fn(),
      destroy,
    };
  }),
}));

type Adapter = {
  navigate: (url: string) => void;
};

vi.mock('@logto/node/edge', () => ({
  default: vi.fn((_: unknown, { navigate }: Adapter) => ({
    signIn: () => {
      navigate(signInUrl);
      signIn();
    },
    handleSignInCallback: (url: string) => {
      handleSignInCallback(url);
      navigate(postRedirectUri);
    },
    getContext,
    getIdTokenClaims,
    signOut: async () => {
      await signOut();
      navigate(configs.baseUrl);
    },
    isAuthenticated: true,
  })),
}));

describe('Next (server actions)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates an instance without crash', () => {
    expect(() => new LogtoClient(configs)).not.toThrow();
  });

  describe('handleSignIn', () => {
    it('should get redirect url', async () => {
      const client = new LogtoClient(configs);
      const { url } = await client.handleSignIn(signInUrl);
      expect(url).toEqual(signInUrl);
    });
  });

  describe('handleSignInCallback', () => {
    it('should call nodClient.handleSignInCallback and return postRedirectUri', async () => {
      const client = new LogtoClient(configs);
      const result = await client.handleSignInCallback(callbackUrl);
      expect(handleSignInCallback).toHaveBeenCalledWith(callbackUrl);
      expect(result).toEqual(postRedirectUri);
    });
  });

  describe('handleSignOut', () => {
    it('should get redirect url', async () => {
      const client = new LogtoClient(configs);
      const url = await client.handleSignOut('{}');
      expect(url).toEqual(configs.baseUrl);
    });

    it('should destroy storage when sign-out fails', async () => {
      const signOutError = new Error('OIDC discovery failed');
      signOut.mockRejectedValueOnce(signOutError);
      const client = new LogtoClient(configs);

      await expect(client.handleSignOut()).rejects.toBe(signOutError);
      expect(destroy).toHaveBeenCalledOnce();
    });
  });

  describe('getLogtoContext', () => {
    it('should get context', async () => {
      const client = new LogtoClient(configs);
      const context = await client.getLogtoContext();
      expect(context).toHaveProperty('isAuthenticated', true);
    });
  });

  describe('createNodeClient', () => {
    it('should get node client', async () => {
      const client = new LogtoClient(configs);
      const nodeClient = await client.createNodeClient();
      expect(nodeClient).toBeDefined();
    });
  });
});
