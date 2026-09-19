import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

import type * as LogtoNode from '@logto/node';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createEvent } from 'h3';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type useRuntimeConfig } from '#imports';

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

// The spread of the original config keeps keys like `app` that the nuxt environment's own
// bootstrap reads; the mock is visible there too.
mockNuxtImport<typeof useRuntimeConfig>('useRuntimeConfig', (original) =>
  vi.fn(() => ({
    ...original(),
    ...runtimeConfig,
    public: { ...original().public, ...runtimeConfig.public },
  }))
);

/**
 * Observable state of the fake Logto client, used to assert on concurrency and on the session
 * data a request-scoped client was created with.
 */
const fakeState = vi.hoisted(() => ({
  tokenCount: 0,
  gateWaiters: 0,
  gate: undefined as Promise<void> | undefined,
  sessionDataSnapshots: [] as Array<Record<string, unknown>>,
}));

// Test fakes need shared mutable state, so the fp rules are relaxed for these helpers.
/* eslint-disable @silverhand/fp/no-mutation */
const resetFakeState = () => {
  fakeState.tokenCount = 0;
  fakeState.gateWaiters = 0;
  fakeState.gate = undefined;
  fakeState.sessionDataSnapshots.length = 0;
};
/* eslint-enable @silverhand/fp/no-mutation */

/**
 * A stand-in for the Logto client that behaves like a refresh: it writes the renewed access token
 * through the adapter storage, which is what the real client does before returning.
 */
vi.mock('@logto/node', async (importOriginal) => {
  const actual = await importOriginal<typeof LogtoNode>();

  class FakeLogtoClient {
    constructor(
      public config: unknown,
      public adapter: {
        storage: { setItem: (key: string, value: string) => Promise<void>; data: unknown };
      }
    ) {
      // The session data the storage was initialized with, captured before any refresh writes.
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      fakeState.sessionDataSnapshots.push({
        ...(this.adapter.storage.data as Record<string, unknown>),
      });
    }

    async isAuthenticated() {
      return true;
    }

    async getAccessToken() {
      /* eslint-disable @silverhand/fp/no-mutation */
      fakeState.gateWaiters += 1;
      await fakeState.gate;
      fakeState.tokenCount += 1;
      /* eslint-enable @silverhand/fp/no-mutation */
      const token = `renewed_access_token_${fakeState.tokenCount}`;
      await this.adapter.storage.setItem('accessToken', token);
      return token;
    }

    async clearAllTokens() {
      await this.adapter.storage.setItem('accessToken', '');
    }
  }

  return { ...actual, default: FakeLogtoClient };
});

const { logtoEventHandler } = await import('../src/runtime/utils/handler');
const { default: serverEventHandler } = await import('../src/runtime/server/event-handler');

const createEventWithUrl = (url: string, sessionCookie?: string) => {
  const incoming = new IncomingMessage(new Socket());
  // eslint-disable-next-line @silverhand/fp/no-mutation
  incoming.url = url;
  // eslint-disable-next-line @silverhand/fp/no-mutation
  incoming.headers = {
    host: 'localhost',
    ...(sessionCookie ? { cookie: `${cookieKey}=${sessionCookie}` } : {}),
  };
  return createEvent(incoming, new ServerResponse(incoming));
};

const getSessionCookieValue = (event: ReturnType<typeof createEventWithUrl>) => {
  const header = event.node.res.getHeader('set-cookie');
  return new RegExp(`${cookieKey}=([^;]*)`).exec(String(header))?.[1];
};

describe('logtoEventHandler access token endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetFakeState();
  });

  it('returns the access token and persists the refreshed session to the response cookies', async () => {
    const event = createEventWithUrl(accessTokenPath);

    await expect(logtoEventHandler(event, runtimeConfig as never)).resolves.toEqual({
      accessToken: 'renewed_access_token_1',
    });

    // The refreshed session has to travel back with the response, otherwise the next request
    // would have to refresh all over again.
    const setCookie = event.node.res.getHeader('set-cookie');
    expect(setCookie).toBeDefined();
    expect(String(setCookie)).toContain(`${cookieKey}=`);
  });

  it('propagates the access token payload through the server route wrapper', async () => {
    const event = createEventWithUrl(accessTokenPath);

    // Nitro mounts the route-less handler as middleware, so the payload only reaches the browser
    // when the wrapper returns it.
    await expect(serverEventHandler(event)).resolves.toEqual({
      accessToken: 'renewed_access_token_1',
    });
  });

  it('serializes concurrent refreshes for the same session and reuses the rotated session', async () => {
    // Seed a session cookie through an initial request.
    const seed = createEventWithUrl(accessTokenPath);
    await logtoEventHandler(seed, runtimeConfig as never);
    const sessionCookie = getSessionCookieValue(seed);
    expect(sessionCookie).toBeDefined();

    // Block the first concurrent request's refresh until the second one has queued up.
    /* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation */
    let openGate!: () => void;
    fakeState.gate = new Promise<void>((resolve) => {
      openGate = resolve;
    });
    /* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation */

    const first = createEventWithUrl(accessTokenPath, sessionCookie);
    const second = createEventWithUrl(accessTokenPath, sessionCookie);

    // The seed request already passed through `getAccessToken`, so its wait is the baseline.
    const seededWaiters = fakeState.gateWaiters;

    const firstResult = logtoEventHandler(first, runtimeConfig as never);
    // Wait until the first request holds the session lock and is blocked in its refresh.
    await vi.waitFor(() => {
      expect(fakeState.gateWaiters).toBe(seededWaiters + 1);
    });
    const secondResult = logtoEventHandler(second, runtimeConfig as never);
    // Give the second request enough time to reach the token endpoint.
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });

    // The second request must wait for the first one's refresh instead of refreshing the same
    // session in parallel: refresh token rotation would treat the reused token as theft.
    expect(fakeState.gateWaiters).toBe(seededWaiters + 1);

    openGate();
    await expect(firstResult).resolves.toEqual({ accessToken: 'renewed_access_token_2' });
    await expect(secondResult).resolves.toEqual({ accessToken: 'renewed_access_token_3' });

    // The second request adopted the session the first one minted (token _2) instead of the
    // stale cookie (token _1) it arrived with.
    expect(fakeState.sessionDataSnapshots[2]).toEqual({
      accessToken: 'renewed_access_token_2',
    });

    // Both responses carry the session they used, so the browser converges on the freshest one.
    expect(getSessionCookieValue(first)).toBeDefined();
    expect(getSessionCookieValue(second)).toBeDefined();
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
