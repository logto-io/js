import { LogtoError } from '../modules/errors';
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
    test('json text with error description should throw LogtoError with error description', async () => {
      const errorDescription = 'some error description';
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        text: async () => {
          return JSON.stringify({ error_description: errorDescription });
        },
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toThrowError(
        new LogtoError({ message: errorDescription })
      );
    });

    test('json text without error description should throw LogtoError with response status text', async () => {
      const statusText = 'some error status';
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        text: async () => JSON.stringify({}),
        statusText,
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toThrowError(new LogtoError({ message: statusText }));
    });

    test('non-json text should throw LogtoError with response text', async () => {
      const errorText = 'some error text';
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        text: async () => errorText,
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toThrowError(new LogtoError({ message: errorText }));
    });
  });
});
