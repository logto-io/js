import { LogtoRequestError } from './errors';
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

  describe('request error', () => {
    test('failing response json with code and message should throw LogtoRequestError with same code and message', async () => {
      const code = 'some error code';
      const message = 'some error message';
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ code, message }),
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toMatchError(new LogtoRequestError(code, message));
    });

    test('failing response json with only code should throw StructError', async () => {
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => {
          throw new TypeError('without message');
        },
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toThrowError(TypeError);
    });

    test('failing response json with only message should throw StructError', async () => {
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => {
          throw new TypeError('without code');
        },
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toThrowError(TypeError);
    });

    test('failing response json without code and message should throw StructError', async () => {
      const fetchFunction = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => {
          throw new TypeError('without code and message');
        },
      });
      const requester = createRequester(fetchFunction);
      await expect(requester('foo')).rejects.toThrowError(TypeError);
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
