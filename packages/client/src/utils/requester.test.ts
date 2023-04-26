import { LogtoError, LogtoRequestError } from '@logto/js';

import { createRequester } from './requester.js';

describe('createRequester', () => {
  describe('successful response', () => {
    test('should return data', async () => {
      const data = { foo: 'bar' };
      const fetchFunction = jest.fn().mockResolvedValue({
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
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ code, message }),
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchError(new LogtoRequestError(code, message));
    });

    test('failing response json with more than code and message should throw LogtoRequestError with same code and message', async () => {
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ code, message, foo: 'bar' }),
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchError(new LogtoRequestError(code, message));
    });

    test('failing response json with only code should throw LogtoError', async () => {
      const json = { code };
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => json,
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchError(
        new LogtoError('unexpected_response_error', json)
      );
    });

    test('failing response json with only message should throw LogtoError', async () => {
      const json = { message };
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => json,
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchError(
        new LogtoError('unexpected_response_error', json)
      );
    });

    test('failing response json without code and message should throw LogtoError', async () => {
      const json = {};
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => json,
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchError(
        new LogtoError('unexpected_response_error', json)
      );
    });

    test('failing response with non-json text should throw TypeError', async () => {
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => {
          throw new TypeError('not json content');
        },
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toThrowError(TypeError);
    });
  });
});
