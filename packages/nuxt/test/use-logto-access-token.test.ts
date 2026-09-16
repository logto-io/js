import { setTimeout as sleep } from 'node:timers/promises';

import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import useLogtoAccessToken from '../src/runtime/composables/use-logto-access-token';
import { NotAuthenticatedErrorCode } from '../src/runtime/utils/constants';

const accessTokenPath = '/api/logto/access-token';

/**
 * A single Nuxt app instance and a persistent state store, so that repeated composable calls share
 * exactly what they would share inside a running application.
 */
const nuxt = vi.hoisted(() => ({
  app: {},
  state: new Map<string, unknown>(),
}));

mockNuxtImport('useNuxtApp', () => vi.fn(() => nuxt.app));

mockNuxtImport('useState', () =>
  vi.fn((key: string, init: () => unknown) => {
    if (!nuxt.state.has(key)) {
      nuxt.state.set(key, ref(init()));
    }

    return nuxt.state.get(key);
  })
);

mockNuxtImport('useRuntimeConfig', () => vi.fn(() => ({ public: { logto: { accessTokenPath } } })));

const fetchMock = vi.fn();
vi.stubGlobal('$fetch', fetchMock);

const unauthorizedError = {
  statusCode: 401,
  data: { code: NotAuthenticatedErrorCode },
};

describe('useLogtoAccessToken', () => {
  beforeEach(() => {
    nuxt.state.clear();
    fetchMock.mockReset();
  });

  it('returns the access token and exposes it as state', async () => {
    fetchMock.mockResolvedValue({ accessToken: 'access_token_1' });
    const { accessToken, error, pending, refresh } = useLogtoAccessToken();

    expect(pending.value).toBe(false);

    await expect(refresh()).resolves.toBe('access_token_1');
    expect(accessToken.value).toBe('access_token_1');
    expect(error.value).toBeUndefined();
    expect(pending.value).toBe(false);
  });

  it('reports pending while the request is in flight', async () => {
    fetchMock.mockImplementation(async () => {
      await sleep(10);
      return { accessToken: 'access_token_1' };
    });

    const { pending, refresh } = useLogtoAccessToken();
    const request = refresh();

    expect(pending.value).toBe(true);

    await request;

    expect(pending.value).toBe(false);
  });

  it('shares a single request between concurrent callers of the same token', async () => {
    fetchMock.mockImplementation(async () => {
      await sleep(10);
      return { accessToken: 'shared_token' };
    });

    // Two components asking for the same token at the same time.
    const first = useLogtoAccessToken();
    const second = useLogtoAccessToken();
    const firstRequest = first.refresh();
    const secondRequest = second.refresh();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await expect(firstRequest).resolves.toBe('shared_token');
    await expect(secondRequest).resolves.toBe('shared_token');
  });

  it('starts a separate request for a different resource', async () => {
    fetchMock.mockResolvedValue({ accessToken: 'access_token_1' });

    const first = useLogtoAccessToken({ resource: 'https://api.example.com' });
    const second = useLogtoAccessToken({ resource: 'https://other.example.com' });

    await Promise.all([first.refresh(), second.refresh()]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('forwards the resource and organization as query parameters', async () => {
    fetchMock.mockResolvedValue({ accessToken: 'access_token_1' });

    await useLogtoAccessToken({
      resource: 'https://api.example.com',
      organizationId: 'org_123',
    }).refresh();

    expect(fetchMock).toHaveBeenCalledWith(accessTokenPath, {
      query: { resource: 'https://api.example.com', organizationId: 'org_123' },
      cache: 'no-store',
    });
  });

  it('surfaces an authentication error so the caller can start a sign-in', async () => {
    fetchMock.mockRejectedValue(unauthorizedError);
    const { accessToken, error, refresh } = useLogtoAccessToken();

    await expect(refresh()).resolves.toBeUndefined();
    expect(error.value).toEqual({ statusCode: 401, code: NotAuthenticatedErrorCode });
    expect(accessToken.value).toBeUndefined();
  });

  it('falls back to a generic code for non-authentication failures', async () => {
    fetchMock.mockRejectedValue({ statusCode: 500, data: {} });
    const { error, refresh } = useLogtoAccessToken();

    await refresh();

    expect(error.value).toEqual({ statusCode: 500, code: 'request_failed' });
  });

  it('clears the previous error once a later request succeeds', async () => {
    fetchMock.mockRejectedValueOnce(unauthorizedError);
    const { accessToken, error, refresh } = useLogtoAccessToken();

    await refresh();
    expect(error.value).toBeDefined();

    fetchMock.mockResolvedValueOnce({ accessToken: 'access_token_2' });
    await expect(refresh()).resolves.toBe('access_token_2');

    expect(error.value).toBeUndefined();
    expect(accessToken.value).toBe('access_token_2');
  });

  it('allows a retry after a failed request instead of caching the failure', async () => {
    fetchMock.mockRejectedValueOnce(unauthorizedError);
    const { refresh } = useLogtoAccessToken();

    await refresh();
    fetchMock.mockResolvedValueOnce({ accessToken: 'access_token_2' });

    await expect(refresh()).resolves.toBe('access_token_2');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
