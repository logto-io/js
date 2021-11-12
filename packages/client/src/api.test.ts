/**
 * @jest-environment node
 */

import { createRequester } from './api';

describe('api (NodeJS)', () => {
  test('should throw on empty fetchFunction', () => {
    expect(() => createRequester()).toThrowError('You should provide a fetch function in NodeJS');
  });
});
