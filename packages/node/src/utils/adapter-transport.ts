import type { ClientAdapter } from '@logto/client';

type AdapterTransport = Pick<ClientAdapter, 'fetch' | 'requester'>;

export const createAuthenticatedFetch =
  (authorization: string): typeof globalThis.fetch =>
  async (input, init) => {
    const request = new Request(input, init);

    if (!request.headers.has('Authorization')) {
      request.headers.set('Authorization', authorization);
    }

    return fetch(request);
  };

export const resolveAdapterTransport = (
  adapter: AdapterTransport,
  defaultFetch?: typeof globalThis.fetch
): AdapterTransport => {
  if (adapter.fetch) {
    return { fetch: adapter.fetch };
  }

  if (adapter.requester) {
    return { requester: adapter.requester };
  }

  return defaultFetch ? { fetch: defaultFetch } : {};
};
