import { ServerResponse, IncomingMessage } from 'node:http';
import { Socket } from 'node:net';

import * as logtoNode from '@logto/node';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createEvent } from 'h3';
import { describe, expect, it, vi, type Mock } from 'vitest';

mockNuxtImport('useRuntimeConfig', () =>
  vi.fn(() => ({
    logto: {
      cookieEncryptionKey: 'foo',
      pathnames: {
        signIn: '/sign-in',
        signOut: '/sign-out',
        callback: '/callback',
      },
    },
  }))
);
const cookies = new Map();
const getRequestURL = vi.fn(() => new URL('http://localhost:3000'));
const sendRedirect = vi.fn();

vi.doMock('h3', async (importOriginal) => ({
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...(await importOriginal<{}>()),
  defineEventHandler: vi.fn((handler: unknown) => handler),
  getRequestURL,
  getCookie: vi.fn((_event: unknown, name: string) => cookies.get(name)),
  setCookie: vi.fn((_event: unknown, name: string, value: string) => {
    cookies.set(name, value);
  }),
  sendRedirect,
}));

const { default: handler } = await import('@/src/runtime/server/event-handler');

const LogtoClient = vi.fn();

vi.spyOn(logtoNode, 'default', 'get').mockImplementation(() => {
  /* eslint-disable @silverhand/fp/no-mutation */
  LogtoClient.prototype.signIn = vi.fn();
  LogtoClient.prototype.isAuthenticated = vi.fn().mockResolvedValue(false);
  LogtoClient.prototype.handleSignInCallback = vi.fn();
  /* eslint-enable @silverhand/fp/no-mutation */
  return LogtoClient;
});

const createH3Event = () => {
  const incoming = new IncomingMessage(new Socket());
  const response = new ServerResponse(incoming);
  return createEvent(incoming, response);
};

describe('event-handler', async () => {
  it('should inject logto client', async () => {
    const event = createH3Event();
    await handler(event);

    expect(event.context.logtoClient).toBeInstanceOf(LogtoClient);
  });

  it('should handle sign-in', async () => {
    const event = createH3Event();
    getRequestURL.mockReturnValueOnce(new URL('http://localhost:3000/sign-in'));
    await handler(event);
    expect(LogtoClient.prototype.signIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost:3000/callback',
    });
  });

  it('should handle callback with custom callback pathname', async () => {
    const event = createH3Event();
    // @ts-expect-error
    (useRuntimeConfig as Mock<typeof useRuntimeConfig>).mockReturnValueOnce({
      logto: {
        postCallbackRedirectUri: '/',
        cookieEncryptionKey: 'foo',
        pathnames: {
          signIn: '/sign-in',
          signOut: '/sign-out',
          callback: '/callback-1',
        },
      },
    });
    getRequestURL.mockReturnValueOnce(new URL('http://localhost:3000/callback-1'));
    await handler(event);
    expect(LogtoClient.prototype.handleSignInCallback).toHaveBeenCalledWith(
      'http://localhost:3000/callback-1'
    );
    expect(sendRedirect).toHaveBeenCalledWith(event, '/', 302);
  });
});
