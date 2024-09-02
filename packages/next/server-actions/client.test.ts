import { type LogtoNextConfig } from '../src/types.js';

import LogtoClient from './client.js';

const signInUrl = 'http://mock-logto-server.com/sign-in';
const callbackUrl = 'http://localhost:3000/callback';

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

vi.mock('@logto/node', () => ({
  CookieStorage: vi.fn((_, cookie: string) => {
    return {
      init: vi.fn(),
      destroy: vi.fn(),
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

describe('Next (server actions)', () => {
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
    it('should call nodClient.handleSignInCallback', async () => {
      const client = new LogtoClient(configs);
      await client.handleSignInCallback(callbackUrl);
      expect(handleSignInCallback).toHaveBeenCalledWith(callbackUrl);
    });
  });

  describe('handleSignOut', () => {
    it('should get redirect url', async () => {
      const client = new LogtoClient(configs);
      const url = await client.handleSignOut('{}');
      expect(url).toEqual(configs.baseUrl);
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
