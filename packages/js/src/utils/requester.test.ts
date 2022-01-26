import { LogtoError } from './errors';
import { createRequester } from './requester';

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

  describe('non-ok response', () => {
    test('json text with error and error description should throw LogtoError with error and error description', async () => {
      const error = 'some error';
      const errorDescription = 'some error description';
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        text: async () => {
          return JSON.stringify({
            error,
            error_description: errorDescription,
          });
        },
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchError(
        new LogtoError('requester.failed', error, errorDescription)
      );
    });

    test('json text with only error should throw LogtoError with error', async () => {
      const error = 'some error';
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        text: async () => {
          return JSON.stringify({ error });
        },
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchError(
        new LogtoError('requester.failed', error)
      );
    });

    test('json text with only error description should throw LogtoError with error description', async () => {
      const errorDescription = 'some error description';
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        text: async () => {
          return JSON.stringify({ error_description: errorDescription });
        },
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchError(
        new LogtoError('requester.failed', undefined, errorDescription)
      );
    });

    test('json text without error and error description should throw LogtoError with response status text', async () => {
      const statusText = 'some error status';
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        text: async () => JSON.stringify({}),
        statusText,
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchError(
        new LogtoError('requester.failed', undefined, undefined, statusText)
      );
    });

    test('non-json text should throw LogtoError with response text', async () => {
      const errorText = 'some error text';
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        text: async () => errorText,
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchError(
        new LogtoError('requester.failed', undefined, undefined, errorText)
      );
    });
  });
});
