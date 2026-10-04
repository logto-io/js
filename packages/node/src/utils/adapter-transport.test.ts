import { createAuthenticatedFetch } from './adapter-transport.js';

describe('createAuthenticatedFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('preserves a prepared request and its authorization', async () => {
    const fetchTransport = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(null));
    const input = new Request('https://logto.example.com/token', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer old-token',
        'Content-Type': 'text/plain',
        'X-Custom': 'custom-value',
      },
      body: 'request-body',
      referrer: 'https://logto.example.com/source',
      referrerPolicy: 'origin',
    });

    await createAuthenticatedFetch('Basic credentials')(input);

    expect(fetchTransport).toHaveBeenCalledOnce();
    const forwardedInput = fetchTransport.mock.calls[0]![0];
    expect(forwardedInput).toBeInstanceOf(Request);

    const forwardedRequest = new Request(forwardedInput);
    expect(forwardedRequest.method).toBe('POST');
    expect(forwardedRequest.headers.get('Authorization')).toBe('Bearer old-token');
    expect(forwardedRequest.headers.get('Content-Type')).toBe('text/plain');
    expect(forwardedRequest.headers.get('X-Custom')).toBe('custom-value');
    expect(forwardedRequest.referrer).toBe('https://logto.example.com/source');
    expect(forwardedRequest.referrerPolicy).toBe('origin');
    await expect(forwardedRequest.text()).resolves.toBe('request-body');
  });

  it('sets authorization when the request does not provide it', async () => {
    const fetchTransport = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(null));

    await createAuthenticatedFetch('Basic credentials')('https://logto.example.com/token');

    expect(fetchTransport).toHaveBeenCalledOnce();
    const forwardedInput = fetchTransport.mock.calls[0]![0];
    expect(forwardedInput).toBeInstanceOf(Request);
    expect(new Request(forwardedInput).headers.get('Authorization')).toBe('Basic credentials');
  });
});
