import type { NextRequest } from 'next/server';

import type { LogtoNextConfig } from '../src/types.js';

import LogtoClient from './index.js';

const signOut = vi.fn();
const destroy = vi.fn();

vi.mock('@logto/node', () => ({
  CookieStorage: vi.fn(
    (config: {
      setCookie: (name: string, value: string, options: { maxAge: number }) => void;
    }) => ({
      init: vi.fn(),
      destroy: async () => {
        destroy();
        config.setCookie('logto-session', '', { maxAge: 0 });
      },
    })
  ),
}));

type Adapter = {
  navigate: (url: string) => void;
};

vi.mock('@logto/node/edge', () => ({
  default: vi.fn((_: unknown, { navigate }: Adapter) => ({
    signOut: async () => {
      await signOut();
      navigate('https://logto.example.com/oidc/session/end');
    },
  })),
}));

const config: LogtoNextConfig = {
  appId: 'app-id',
  baseUrl: 'https://app.example.com',
  cookieSecret: 'complex_password_at_least_32_characters_long',
  cookieSecure: false,
  endpoint: 'https://logto.example.com',
};

describe('Next (edge): sign-out', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the remote sign-out redirect with the destroyed session cookie', async () => {
    const client = new LogtoClient(config);
    const handler = client.handleSignOut();
    const response = await handler(
      new Request('https://app.example.com/api/logto/sign-out') as NextRequest
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toBe('https://logto.example.com/oidc/session/end');
    expect(response.headers.get('Set-Cookie')).toContain('logto-session=');
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('returns the clearing cookie when remote sign-out fails', async () => {
    signOut.mockRejectedValueOnce(new Error('OIDC discovery failed'));
    const client = new LogtoClient(config);
    const handler = client.handleSignOut();
    const response = await handler(
      new Request('https://app.example.com/api/logto/sign-out') as NextRequest
    );

    expect(response.status).toBe(500);
    expect(response.headers.get('Set-Cookie')).toContain('logto-session=');
    expect(destroy).toHaveBeenCalledOnce();
  });
});
