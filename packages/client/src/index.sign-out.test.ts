import LogtoClient from './index.js';
import {
  appId,
  endpoint,
  fetchOidcConfig,
  navigate,
  MockedStorage,
  requester,
  createClient,
  postSignOutRedirectUri,
  revocationEndpoint,
  endSessionEndpoint,
  failingRequester,
  createAdapters,
} from './mock.js';

jest.mock('@logto/js', () => ({
  ...jest.requireActual('@logto/js'),
  fetchOidcConfig: async () => fetchOidcConfig(),
}));

describe('LogtoClient', () => {
  describe('signOut', () => {
    const storage = new MockedStorage();

    beforeEach(() => {
      jest.clearAllMocks();
      storage.reset({
        idToken: 'id_token_value',
        refreshToken: 'refresh_token_value',
        accessToken: 'access_token_map_json_string',
      });
    });

    it('should call token revocation endpoint with requester', async () => {
      const logtoClient = createClient(undefined, storage);
      await logtoClient.signOut(postSignOutRedirectUri);

      expect(requester).toHaveBeenCalledWith(revocationEndpoint, expect.anything());
    });

    it('should clear id token, refresh token and access token from storage', async () => {
      const logtoClient = createClient(undefined, storage);
      await logtoClient.signOut(postSignOutRedirectUri);

      await expect(storage.getItem('idToken')).resolves.toBeNull();
      await expect(storage.getItem('refreshToken')).resolves.toBeNull();
      await expect(storage.getItem('accessToken')).resolves.toBeNull();
    });

    it('should redirect to post sign-out URI after signing out', async () => {
      const logtoClient = createClient(undefined, storage);
      await logtoClient.signOut(postSignOutRedirectUri);
      const encodedRedirectUri = encodeURIComponent(postSignOutRedirectUri);

      expect(navigate).toHaveBeenCalledWith(
        `${endSessionEndpoint}?client_id=${appId}&post_logout_redirect_uri=${encodedRedirectUri}`,
        postSignOutRedirectUri
      );
    });

    it('should not block sign out flow even if token revocation is failed', async () => {
      const logtoClient = new LogtoClient(
        { endpoint, appId },
        {
          ...createAdapters(),
          requester: failingRequester,
          storage,
        }
      );

      await expect(logtoClient.signOut()).resolves.not.toThrow();
      expect(failingRequester).toBeCalledTimes(1);
      await expect(storage.getItem('idToken')).resolves.toBeNull();
      await expect(storage.getItem('refreshToken')).resolves.toBeNull();
      await expect(storage.getItem('accessToken')).resolves.toBeNull();
      expect(navigate).toHaveBeenCalledWith(`${endSessionEndpoint}?client_id=${appId}`, undefined);
    });
  });
});
