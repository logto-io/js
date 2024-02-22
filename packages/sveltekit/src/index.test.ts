import { CookieStorage } from '@logto/node';
import { redirect, type RequestEvent } from '@sveltejs/kit';

import { LogtoClient, handleLogto } from './index.js';

const resolve = jest.fn();

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
  return new CookieStorage(
    {
      ...cookieConfig,
      getCookie: (name) => event.cookies.get(name),
      setCookie: (name, value, options) => {
        event.cookies.set(name, value, options);
      },
    },
    {
      headers: event.request.headers,
      url: event.url.href,
    }
  );
};

describe('handleLogto()', () => {
  it('should inject the Logto client into the request locals', async () => {
    const handle = handleLogto(config, cookieConfig);
    const event = createMockEvent();
    await handle({ resolve, event });
    expect(event.locals.logtoClient).toBeInstanceOf(LogtoClient);
  });

  it('should print a warning if the Logto client is already in the request locals', async () => {
    const handle = handleLogto(config, cookieConfig);
    const spy = jest.spyOn(console, 'warn');
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

    jest.spyOn(client, 'handleSignInCallback').mockResolvedValueOnce();

    const handle = handleLogto(config, cookieConfig, { buildLogtoClient: () => client });
    await handle({ resolve, event });
    expect(redirect).toHaveBeenCalledTimes(1);
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

    jest.spyOn(client, 'isAuthenticated').mockResolvedValueOnce(true);
    // @ts-expect-error
    jest.spyOn(client, 'getIdTokenClaims').mockResolvedValueOnce({ name: 'John Doe' });

    const handle = handleLogto(config, cookieConfig, { buildLogtoClient: () => client });

    await handle({ resolve, event });
    expect(event.locals.user).toEqual({ name: 'John Doe' });
  });
});
