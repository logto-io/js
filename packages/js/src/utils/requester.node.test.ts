/**
 * @jest-environment node
 */
import { LogtoError } from './errors';
import { createRequester } from './requester';

describe('createRequester', () => {
  test('should throw when not providing fetch function under node.js environment', () => {
    expect(() => createRequester()).toMatchError(new LogtoError('requester.not_provide_fetch'));
  });
});
