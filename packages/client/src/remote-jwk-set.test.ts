import { ClientAdapterInstance } from './adapter/index.js';
import { createAdapters } from './mock.js';
import { CachedRemoteJwkSet } from './remote-jwk-set.js';

jest.mock('jose', () => ({
  createLocalJWKSet: jest.fn().mockReturnValue(jest.fn()),
}));

const adapterInstance = new ClientAdapterInstance(createAdapters(true));

jest.spyOn(adapterInstance, 'getWithCache').mockImplementation(async () => ({}));
const createLocalJWKSet = jest.spyOn(jest.requireMock('jose'), 'createLocalJWKSet');

describe('CachedRemoteJwkSet', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to cache the get key function', async () => {
    const remoteJwkSet = new CachedRemoteJwkSet(new URL('https://example.com'), adapterInstance);
    const [function1, function2] = await Promise.all([
      remoteJwkSet.getKey({ alg: 'alg' }, { payload: 'test', signature: 'test' }),
      remoteJwkSet.getKey({ alg: 'alg' }, { payload: 'test', signature: 'test' }),
    ]);

    expect(function1).toBe(function2);
    expect(adapterInstance.getWithCache).toHaveBeenCalledTimes(2);
  });

  it('should be able to reload when mismatching key error occurred', async () => {
    const remoteJwkSet = new CachedRemoteJwkSet(new URL('https://example.com'), adapterInstance);

    class MockNoMatchingKeyError extends Error {
      code = 'ERR_JWKS_NO_MATCHING_KEY';
    }

    // Should throw at `#getLocalKey`, but I don't want to create a new class for this
    createLocalJWKSet.mockImplementationOnce(() => {
      throw new MockNoMatchingKeyError();
    });

    await remoteJwkSet.getKey({ alg: 'alg' }, { payload: 'test', signature: 'test' });
    expect(adapterInstance.getWithCache).toHaveBeenCalledTimes(2);
    expect(createLocalJWKSet).toHaveBeenCalledTimes(2);
  });
});
