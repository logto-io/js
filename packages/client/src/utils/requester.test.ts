import { LogtoError, LogtoRequestError } from '@logto/js';
import { assert } from '@silverhand/essentials';

import { createRequester } from './requester.js';

const waitForAbort = async (signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }

    signal.addEventListener(
      'abort',
      () => {
        resolve();
      },
      { once: true }
    );
  });

describe('createRequester', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('successful response', () => {
    test('should return data', async () => {
      const data = { foo: 'bar' };
      const fetchFunction = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => data,
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).resolves.toEqual(data);
    });
  });

  describe('request timeout', () => {
    it.each([0, -1, 0.5, 2_147_483_648, Number.NaN, Number.POSITIVE_INFINITY])(
      'rejects invalid timeout %s',
      (requestTimeoutMs) => {
        expect(() =>
          createRequester(vi.fn(), {
            requestTimeoutMs,
          })
        ).toThrow('requestTimeoutMs must be an integer between 1 and 2147483647.');
      }
    );

    it('preserves Request referrer settings when adding the timeout signal', async () => {
      const input = new Request('https://logto.example.com/token', {
        referrer: 'https://logto.example.com/source',
        referrerPolicy: 'origin',
      });
      const fetchFunction = vi.fn(
        async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
          expect(init).toMatchObject({
            referrer: input.referrer,
            referrerPolicy: input.referrerPolicy,
          });

          return Response.json('completed');
        }
      );
      const requester = createRequester(fetchFunction, { requestTimeoutMs: 1000 });

      await expect(requester(input)).resolves.toBe('completed');
    });

    it('preserves and propagates an existing request signal', async () => {
      const sourceController = new AbortController();
      const timeoutController = new AbortController();
      const requestAbortReason = new Error('request aborted');
      vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);
      const fetchFunction = vi.fn(
        async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
          sourceController.abort(requestAbortReason);

          expect(init?.signal?.aborted).toBe(true);
          expect(init?.signal?.reason).toBe(requestAbortReason);

          return Response.json('completed');
        }
      );
      const requester = createRequester(fetchFunction, { requestTimeoutMs: 1000 });

      await expect(
        requester('https://logto.example.com', { signal: sourceController.signal })
      ).rejects.toBe(requestAbortReason);
    });

    it('clears a signal inherited from a Request when signal is null', async () => {
      const sourceController = new AbortController();
      const timeoutController = new AbortController();
      vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);
      sourceController.abort();
      const input = new Request('https://logto.example.com', {
        signal: sourceController.signal,
      });
      const fetchFunction = vi.fn(
        async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
          expect(init?.signal).toBe(timeoutController.signal);

          return Response.json('completed');
        }
      );
      const requester = createRequester(fetchFunction, { requestTimeoutMs: 1000 });

      await expect(requester(input, { signal: null })).resolves.toBe('completed');
    });

    it('waits for fetch to settle after aborting it on timeout', async () => {
      const abortObserved = vi.fn();
      const settleFetch = new AbortController();
      const timeoutController = new AbortController();
      const timeoutError = new DOMException(
        'The operation was aborted due to timeout',
        'TimeoutError'
      );
      vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);
      const fetchFunction = vi.fn(
        async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
          init?.signal?.addEventListener('abort', abortObserved, { once: true });
          await waitForAbort(settleFetch.signal);

          return Response.json('completed');
        }
      );
      const requester = createRequester(fetchFunction, { requestTimeoutMs: 100 });
      const result = requester('https://logto.example.com');

      timeoutController.abort(timeoutError);

      const signal = fetchFunction.mock.calls[0]?.[1]?.signal;
      expect(signal?.aborted).toBe(true);
      expect(signal?.reason).toMatchObject({ name: 'TimeoutError' });
      expect(abortObserved).toHaveBeenCalledOnce();
      await expect(Promise.race([result, Promise.resolve('pending')])).resolves.toBe('pending');

      settleFetch.abort();
      await expect(result).rejects.toMatchObject({ name: 'TimeoutError' });
    });

    it('keeps the timeout active while parsing the response', async () => {
      const settleBody = new AbortController();
      const timeoutController = new AbortController();
      const timeoutError = new DOMException(
        'The operation was aborted due to timeout',
        'TimeoutError'
      );
      vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);
      const fetchFunction = vi.fn(async () =>
        Response.json('completed', {
          headers: { 'content-type': 'application/json' },
        })
      );
      fetchFunction.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          await waitForAbort(settleBody.signal);

          return 'completed';
        },
      } as Response);
      const requester = createRequester(fetchFunction, { requestTimeoutMs: 100 });
      const result = requester('https://logto.example.com');

      timeoutController.abort(timeoutError);
      await expect(Promise.race([result, Promise.resolve('pending')])).resolves.toBe('pending');

      settleBody.abort();
      await expect(result).rejects.toMatchObject({ name: 'TimeoutError' });
    });
  });

  describe('response error', () => {
    const code = 'some error code';
    const message = 'some error message';

    test('failing response json with code and message should throw LogtoRequestError with same code and message', async () => {
      const body = { code, message };
      const fetchFunction = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(body), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        })
      );
      const requester = createRequester(fetchFunction);
      const error: unknown = await requester('foo').catch((error: unknown) => error);

      expect(error).toMatchObject({
        name: 'LogtoRequestError',
        code,
        message,
      });

      assert(error instanceof LogtoRequestError, new TypeError('Expected a LogtoRequestError.'));
      await expect(error.cause?.json()).resolves.toEqual(body);
    });

    test('failing response json with more than code and message should throw LogtoRequestError with same code and message', async () => {
      const fetchFunction = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code, message, foo: 'bar' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        })
      );
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchObject({
        name: 'LogtoRequestError',
        code,
        message,
      });
    });

    test('failing response json with only code should throw LogtoError', async () => {
      const json = { code };
      const fetchFunction = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(json), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        })
      );
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchObject(
        new LogtoError('unexpected_response_error', json)
      );
    });

    test('failing response json with only message should throw LogtoError', async () => {
      const json = { message };
      const fetchFunction = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(json), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        })
      );
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchObject(
        new LogtoError('unexpected_response_error', json)
      );
    });

    test('failing response json without code and message should throw LogtoError', async () => {
      const json = {};
      const fetchFunction = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(json), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        })
      );
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchObject(
        new LogtoError('unexpected_response_error', json)
      );
    });

    test('failing response with non-json text should throw LogtoRequestError', async () => {
      const body = 'not json content';
      const fetchFunction = vi.fn().mockResolvedValue(
        new Response(body, {
          status: 400,
        })
      );
      const requester = createRequester(fetchFunction);
      const error: unknown = await requester('foo').catch((error: unknown) => error);

      expect(error).toMatchObject({
        name: 'LogtoRequestError',
        code: 'http_error_400',
        message: body,
      });

      assert(error instanceof LogtoRequestError, new TypeError('Expected a LogtoRequestError.'));
      await expect(error.cause?.text()).resolves.toBe(body);
    });

    test('rate limited response with non-json text should throw LogtoRequestError', async () => {
      const fetchFunction = vi.fn().mockResolvedValue(
        new Response('Too many requests', {
          status: 429,
          headers: { 'content-type': 'text/plain' },
        })
      );
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchObject({
        name: 'LogtoRequestError',
        code: 'rate_limited',
        message: 'Too many requests',
      });
    });
  });
});
