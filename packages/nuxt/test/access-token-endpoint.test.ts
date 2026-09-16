import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

import type * as LogtoNode from '@logto/node';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createEvent } from 'h3';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const accessTokenPath = '/api/logto/access-token';
const cookieKey = 'logtoCookies';

const runtimeConfig = vi.hoisted(() => ({
  logto: {
    endpoint: 'https://logto.example.com',
    appId: 'app_id',
    appSecret: 'app_secret',
    cookieEncryptionKey: 'a-random-string',
    pathnames: {
      signIn: '/sign-in',
      signOut: '/sign-out',
      callback: '/callback',
      accessToken: '/api/logto/access-token',
    },
  },
  public: { logto: { accessTokenPath: '/api/logto/access-token' } },
}));

mockNuxtImport('useRuntimeConfig', () => vi.fn(() => runtimeConfig));

/**
 * A stand-in for the Logto client that behaves like a refresh: it writes the renewed access token
 * through the adapter storage, which is what the real client does before returning.
 */
vi.mock('@logto/node', async (importOriginal) => {
  const actual = await importOriginal<typeof LogtoNode>();

  class FakeLogtoClient {
    constructor(
      public config: unknown,
      public adapter: { storage: { setItem: (key: string, value: string) => Promise<void> } }
    ) {}

    async isAuthenticated() {
      return true;
    }

    async getAccessToken() {
      await this.adapter.storage.setItem('accessToken', 'renewed_access_token');
      return 'renewed_access_token';
    }

    async clearAllTokens() {
      await this.adapter.storage.setItem('accessToken', '');
    }
  }

  return { ...actual, default: FakeLogtoClient };
});

const { logtoEventHandler } = await import('../src/runtime/utils/handler');

const createEventWithUrl = (url: string) => {
  const incoming = new IncomingMessage(new Socket());
  // eslint-disable-next-line @silverhand/fp/no-mutation
  incoming.url = url;
  // eslint-disable-next-line @silverhand/fp/no-mutation
  incoming.headers = { host: 'localhost' };
  return createEvent(incoming, new ServerResponse(incoming));
};

describe('logtoEventHandler access token endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the access token and persists the refreshed session to the response cookies', async () => {
    const event = createEventWithUrl(accessTokenPath);

    await expect(logtoEventHandler(event, runtimeConfig as never)).resolves.toEqual({
      accessToken: 'renewed_access_token',
    });

    // The refreshed session has to travel back with the response, otherwise the next request
    // would have to refresh all over again.
    const setCookie = event.node.res.getHeader('set-cookie');
    expect(setCookie).toBeDefined();
    expect(String(setCookie)).toContain(`${cookieKey}=`);
  });

  it('does not resolve user info for a token request', async () => {
    const event = createEventWithUrl(accessTokenPath);

    await logtoEventHandler(event, runtimeConfig as never);

    // The token endpoint answers before the user context is populated.
    expect(event.context.logtoClient).toBeUndefined();
    expect(event.context.logtoUser).toBeUndefined();
  });

  it('leaves other requests to the normal flow', async () => {
    const event = createEventWithUrl('/some-page');

    await logtoEventHandler(event, runtimeConfig as never);

    expect(event.context.logtoClient).toBeDefined();
    expect(event.node.res.getHeader('set-cookie')).toBeUndefined();
  });
});
