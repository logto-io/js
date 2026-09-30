import {
  MockedStorage,
  requester,
  createClient,
  accessToken,
  refreshToken,
  idToken,
} from './mock.js';
import { buildAccessTokenKey } from './utils/index.js';

const storedAccessTokens = () =>
  JSON.stringify({
    [buildAccessTokenKey()]: {
      token: accessToken,
      scope: '',
      expiresAt: Date.now() / 1000 + 1000,
    },
  });

/** Persistent storage whose access token map resolves after the other items. */
const createSlowStorage = () => {
  const storage = new MockedStorage({ idToken, refreshToken, accessToken: storedAccessTokens() });
  const readItem = storage.getItem.bind(storage);
  vi.spyOn(storage, 'getItem').mockImplementation(async (key) => {
    if (key === 'accessToken') {
      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
    }
    return readItem(key);
  });
  return storage;
};

describe('LogtoClient persisted access tokens', () => {
  beforeEach(() => {
    requester.mockClear();
  });

  it('should wait for the stored access token instead of refreshing it', async () => {
    const logtoClient = createClient(undefined, createSlowStorage());

    await expect(logtoClient.getAccessToken()).resolves.toEqual(accessToken);
    expect(requester).not.toHaveBeenCalled();
  });

  it('should use the access tokens of storage replaced after construction', async () => {
    const logtoClient = createClient(undefined, new MockedStorage({ idToken, refreshToken }));
    // A subclass swapping in its own storage adapter, as the Capacitor SDK does.
    // eslint-disable-next-line @silverhand/fp/no-mutation
    logtoClient.adapter.storage = new MockedStorage({
      idToken,
      refreshToken,
      accessToken: storedAccessTokens(),
    });
    void logtoClient.runReloadAccessTokenMap();

    await expect(logtoClient.getAccessToken()).resolves.toEqual(accessToken);
    expect(requester).not.toHaveBeenCalled();
  });

  it('should not restore access tokens cleared while they are still loading', async () => {
    const storage = createSlowStorage();
    const logtoClient = createClient(undefined, storage);

    await logtoClient.clearAccessToken();

    expect(logtoClient.getAccessTokenMap().size).toBe(0);
    await expect(storage.getItem('accessToken')).resolves.toBeNull();
  });
});
