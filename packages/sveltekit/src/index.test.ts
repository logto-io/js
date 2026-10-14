import { CookieStorage } from '@logto/node';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LogtoClient, handleLogto } from './index.js';

vi.mock('@sveltejs/kit', { spy: true });

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

const resolve = vi.fn();

const createMockEvent = (
  initialCookies: Record<string, string> = {},
  url = 'http://localhost/',
  headers = new Map()
): RequestEvent => {
  const cookies = new Map(Object.entries(initialCookies));

  return {
    // @ts-expect-error
    locals: {},
    // @ts-expect-error
    cookies: {
      get: (name: string) => cookies.get(name),
      getAll: () => [...cookies.entries()].map(([name, value]) => ({ name, value })),
      set: (name: string, value: string) => cookies.set(name, value),
      delete: (name: string) => cookies.delete(name),
    },
    url: new URL(url),
    request: {
      url,
      // @ts-expect-error
      headers,
    },
  };
};

const config = Object.freeze({
  endpoint: 'https://example.com',
  appId: 'appId',
  appSecret: 'appSecret',
});

const cookieConfig = Object.freeze({
  encryptionKey: 'encryptionKey',
});

const createCookieStorageFromEvent = (event: RequestEvent) => {
  return new CookieStorage({
    ...cookieConfig,
    getCookie: (name) => event.cookies.get(name),
    setCookie: (name, value, options) => {
      event.cookies.set(name, value, options);
    },
  });
};

describe('handleLogto()', () => {
  describe.each([undefined, false, true])(
    'allowExternalPostRedirectUri: %s',
    (allowExternalPostRedirectUri) => {
      it.each(['sign-in', 'sign-out'] as const)(
        'should always allow redirects to Logto for %s',
        async (purpose) => {
          const event = createMockEvent();
          await handleLogto(config, cookieConfig, { allowExternalPostRedirectUri })({
            resolve,
            event,
          });
          const url = 'https://example.com/oidc';

          await expect(async () =>
            event.locals.logtoClient.adapter.navigate(url, { for: purpose })
          ).rejects.toThrow(expect.objectContaining({ status: 302, location: url }));
          expect(redirect).toHaveBeenCalledWith(302, url, { external: true });
        }
      );

      it('should pass the configured permission for post-sign-in redirects', async () => {
        const event = createMockEvent();
        await handleLogto(config, cookieConfig, { allowExternalPostRedirectUri })({
          resolve,
          event,
        });

        await expect(async () =>
          event.locals.logtoClient.adapter.navigate('/dashboard', { for: 'post-sign-in' })
        ).rejects.toThrow(expect.objectContaining({ status: 302, location: '/dashboard' }));
        expect(redirect).toHaveBeenCalledWith(302, '/dashboard', {
          external: allowExternalPostRedirectUri ?? false,
        });
      });
    }
  );

  it('should allow an external post-sign-in destination when opted in', async () => {
    const event = createMockEvent();
    await handleLogto(config, cookieConfig, { allowExternalPostRedirectUri: true })({
      resolve,
      event,
    });
    const url = 'https://another.example.com/dashboard';

    await expect(async () =>
      event.locals.logtoClient.adapter.navigate(url, { for: 'post-sign-in' })
    ).rejects.toThrow(expect.objectContaining({ status: 302, location: url }));
    expect(redirect).toHaveBeenCalledWith(302, url, { external: true });
  });

  it('should handle a redirect rejected by SvelteKit as a callback error', async () => {
    const event = createMockEvent();
    const handle = handleLogto(config, cookieConfig);
    await handle({ resolve, event });
    const client = event.locals.logtoClient;
    const error = new Error('External redirect is not allowed');
    vi.mocked(redirect).mockImplementationOnce(() => {
      throw error;
    });
    vi.spyOn(client, 'handleSignInCallback').mockImplementationOnce(async () => {
      await client.adapter.navigate('https://another.example.com/dashboard', {
        for: 'post-sign-in',
      });
    });

    const callbackEvent = createMockEvent({}, 'http://localhost/callback');
    const callbackHandle = handleLogto(config, cookieConfig, { buildLogtoClient: () => client });
    const response = await callbackHandle({ resolve, event: callbackEvent });

    expect(response.status).toBe(400);
    expect(await response.text()).toBe(`Error: ${error.message}`);
    expect(redirect).toHaveBeenCalledWith(302, 'https://another.example.com/dashboard', {
      external: false,
    });
  });

  it('should rethrow an allowed post-sign-in redirect from the callback', async () => {
    const event = createMockEvent();
    await handleLogto(config, cookieConfig, { allowExternalPostRedirectUri: true })({
      resolve,
      event,
    });
    const client = event.locals.logtoClient;
    const url = 'https://another.example.com/dashboard';
    vi.spyOn(client, 'handleSignInCallback').mockImplementationOnce(async () => {
      await client.adapter.navigate(url, { for: 'post-sign-in' });
    });
    const onCallbackError = vi.fn();
    const callbackHandle = handleLogto(config, cookieConfig, {
      buildLogtoClient: () => client,
      onCallbackError,
    });

    await expect(
      callbackHandle({ resolve, event: createMockEvent({}, 'http://localhost/callback') })
    ).rejects.toThrow(expect.objectContaining({ status: 302, location: url }));
    expect(onCallbackError).not.toHaveBeenCalled();
  });

  it('should inject the Logto client into the request locals', async () => {
    const handle = handleLogto(config, cookieConfig);
    const event = createMockEvent();
    await handle({ resolve, event });
    expect(event.locals.logtoClient).toBeInstanceOf(LogtoClient);
  });

  it('should print a warning if the Logto client is already in the request locals', async () => {
    const handle = handleLogto(config, cookieConfig);
    const spy = vi.spyOn(console, 'warn');
    const event = createMockEvent();
    const client = new LogtoClient(config, {
      navigate: () => {
        console.log('navigate');
      },
      storage: createCookieStorageFromEvent(event),
    });

    // eslint-disable-next-line @silverhand/fp/no-mutation
    event.locals.logtoClient = client;
    await handle({ resolve, event });

    expect(event.locals.logtoClient).toBe(client);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should redirect if it's in a valid sign-in callback", async () => {
    const event = createMockEvent({}, 'http://localhost/callback');
    const client = new LogtoClient(config, {
      navigate: () => {
        console.log('navigate');
      },
      storage: createCookieStorageFromEvent(event),
    });

    vi.spyOn(client, 'handleSignInCallback').mockResolvedValueOnce();

    const handle = handleLogto(config, cookieConfig, { buildLogtoClient: () => client });
    await expect(handle({ resolve, event })).rejects.toThrow(
      expect.objectContaining({ status: 302, location: '/' })
    );
  });

  it('should throw an error if the Logto client cannot handle the sign-in callback', async () => {
    const handle = handleLogto(config, cookieConfig);
    const event = createMockEvent({}, 'http://localhost/callback');
    const response = await handle({ resolve, event });

    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Error: Sign-in session not found.');
  });

  it('should inject `user` into the request locals if the user is authenticated', async () => {
    const event = createMockEvent();
    const client = new LogtoClient(config, {
      navigate: () => {
        console.log('navigate');
      },
      storage: createCookieStorageFromEvent(event),
    });

    vi.spyOn(client, 'isAuthenticated').mockResolvedValueOnce(true);
    // @ts-expect-error
    vi.spyOn(client, 'getIdTokenClaims').mockResolvedValueOnce({ name: 'John Doe' });

    const handle = handleLogto(config, cookieConfig, { buildLogtoClient: () => client });

    await handle({ resolve, event });
    expect(event.locals.user).toEqual({ name: 'John Doe' });
  });

  it('should call onGetUserInfoError if an error occurs while fetching user info', async () => {
    const event = createMockEvent();
    const client = new LogtoClient(config, {
      navigate: () => {
        console.log('navigate');
      },
      storage: createCookieStorageFromEvent(event),
    });

    vi.spyOn(client, 'isAuthenticated').mockResolvedValueOnce(true);
    vi.spyOn(client, 'getIdTokenClaims').mockRejectedValueOnce(new Error('User info error'));

    const handle = handleLogto(config, cookieConfig, {
      buildLogtoClient: () => client,
      onGetUserInfoError: (error: unknown) => {
        if (error instanceof Error) {
          return new Response(error.message, { status: 400 });
        }
        return new Response('Unknown error', { status: 500 });
      },
    });

    const response = await handle({ resolve, event });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('User info error');
  });
});
