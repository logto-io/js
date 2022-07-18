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
        url: '/api/sign-in',
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
});
