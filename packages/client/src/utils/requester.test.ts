import { LogtoError } from '@logto/js';

import { createRequester } from './requester.js';

describe('createRequester', () => {
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

  describe('response error', () => {
    const code = 'some error code';
    const message = 'some error message';

    test('failing response json with code and message should throw LogtoRequestError with same code and message', async () => {
      const fetchFunction = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code, message }), {
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
      const fetchFunction = vi.fn().mockResolvedValue(
        new Response('not json content', {
          status: 400,
        })
      );
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchObject({
        name: 'LogtoRequestError',
        code: 'http_error_400',
        message: 'not json content',
      });
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
