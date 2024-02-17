import { type SessionData, type LogtoNextConfig } from '../src/types.js';

import LogtoClient from './index.js';

const signInUrl = 'http://mock-logto-server.com/sign-in';
const callbackUrl = 'http://localhost:3000/callback';

const configs: LogtoNextConfig = {
  appId: 'app_id_value',
  endpoint: 'https://logto.dev',
  baseUrl: 'http://localhost:3000',
  cookieSecret: 'secret',
  cookieSecure: false,
};

const setItem = jest.fn();
const getItem = jest.fn();
const signIn = jest.fn();
const handleSignInCallback = jest.fn();
const getIdTokenClaims = jest.fn(() => ({
  sub: 'user_id',
}));
const signOut = jest.fn();
const getContext = jest.fn(async () => ({ isAuthenticated: true }));

jest.mock('../src/storage', () =>
  jest.fn(() => ({
    setItem,
    getItem,
    removeItem: jest.fn(),
    destroy: jest.fn(),
    save: jest.fn(),
  }))
);

jest.mock('../src/session', () => ({
  createSession: jest.fn((_, cookie: string) => {
    const data = JSON.parse(cookie) as SessionData;

    const session = {
      ...data,
      save: jest.fn(),
      getValues: jest.fn(async () => JSON.stringify(data)),
    };

    return session;
  }),
}));

type Adapter = {
  navigate: (url: string) => void;
};

jest.mock('@logto/node/edge', () =>
  jest.fn((_: unknown, { navigate }: Adapter) => ({
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
  }))
);

describe('Next (server actions)', () => {
  it('creates an instance without crash', () => {
    expect(() => new LogtoClient(configs)).not.toThrow();
  });

  describe('handleSignIn', () => {
    it('should get redirect url and new cookie', async () => {
      const client = new LogtoClient(configs);
      const { url, newCookie } = await client.handleSignIn('{}', signInUrl);
      expect(url).toEqual(signInUrl);
      expect(newCookie).not.toBeUndefined();
    });
  });

  describe('handleSignInCallback', () => {
    it('should call nodClient.handleSignInCallback', async () => {
      const client = new LogtoClient(configs);
      await client.handleSignInCallback('{}', callbackUrl);
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
      const context = await client.getLogtoContext('{}');
      expect(context).toHaveProperty('isAuthenticated', true);
    });
  });

  describe('createNodeClientFromHeaders', () => {
    it('should get node client', async () => {
      const client = new LogtoClient(configs);
      const nodeClient = await client.createNodeClientFromHeaders('{}');
      expect(nodeClient).toBeDefined();
    });
  });
});
