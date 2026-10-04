import LogtoClient from './index.js';
import {
  appId,
  endpoint,
  navigate,
  MockedStorage,
  requester,
  createClient,
  postSignOutRedirectUri,
  revocationEndpoint,
  endSessionEndpoint,
  failingFetch,
  createAdapters,
  fetchOidcConfig,
} from './mock.js';

describe('LogtoClient', () => {
  describe('signOut', () => {
    const storage = new MockedStorage();

    beforeEach(() => {
      vi.clearAllMocks();
      storage.reset({
        idToken: 'id_token_value',
        refreshToken: 'refresh_token_value',
        accessToken: 'access_token_map_json_string',
        signInSession: 'sign_in_session_json_string',
      });
    });

    it('should call token revocation endpoint with requester', async () => {
      const logtoClient = createClient(undefined, storage);
      await logtoClient.signOut(postSignOutRedirectUri);

      expect(requester).toHaveBeenCalledWith(revocationEndpoint, expect.anything());
    });

    it('should clear all local authentication data from storage', async () => {
      const logtoClient = createClient(undefined, storage);
      await logtoClient.signOut(postSignOutRedirectUri);

      await expect(storage.getItem('idToken')).resolves.toBeNull();
      await expect(storage.getItem('refreshToken')).resolves.toBeNull();
      await expect(storage.getItem('accessToken')).resolves.toBeNull();
      await expect(storage.getItem('signInSession')).resolves.toBeNull();
    });

    it('should redirect to post sign-out URI after signing out', async () => {
      const logtoClient = createClient(undefined, storage);
      await logtoClient.signOut(postSignOutRedirectUri);
      const encodedRedirectUri = encodeURIComponent(postSignOutRedirectUri);

      expect(navigate).toHaveBeenCalledWith(
        `${endSessionEndpoint}?client_id=${appId}&post_logout_redirect_uri=${encodedRedirectUri}`,
        { redirectUri: postSignOutRedirectUri, for: 'sign-out' }
      );
    });

    it('should not block sign out flow even if token revocation is failed', async () => {
      const logtoClient = new LogtoClient(
        { endpoint, appId },
        {
          ...createAdapters(),
          fetch: failingFetch,
          storage,
        }
      );
      vi.spyOn(logtoClient, 'getOidcConfig').mockReturnValue(fetchOidcConfig());

      await expect(logtoClient.signOut()).resolves.not.toThrow();
      expect(failingFetch).toBeCalledTimes(1);
      await expect(storage.getItem('idToken')).resolves.toBeNull();
      await expect(storage.getItem('refreshToken')).resolves.toBeNull();
      await expect(storage.getItem('accessToken')).resolves.toBeNull();
      expect(navigate).toHaveBeenCalledWith(`${endSessionEndpoint}?client_id=${appId}`, {
        redirectUri: undefined,
        for: 'sign-out',
      });
    });

    it('should clear local authentication data before OIDC discovery', async () => {
      const discoveryError = new Error('OIDC discovery failed');
      const logtoClient = createClient(undefined, storage);

      vi.spyOn(logtoClient, 'getOidcConfig').mockRejectedValue(discoveryError);

      await expect(logtoClient.signOut()).rejects.toBe(discoveryError);
      await expect(storage.getItem('idToken')).resolves.toBeNull();
      await expect(storage.getItem('refreshToken')).resolves.toBeNull();
      await expect(storage.getItem('accessToken')).resolves.toBeNull();
      await expect(storage.getItem('signInSession')).resolves.toBeNull();
      expect(requester).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('should keep local authentication data cleared when navigation fails', async () => {
      const navigationError = new Error('Navigation failed');
      const logtoClient = createClient(undefined, storage);

      navigate.mockRejectedValueOnce(navigationError);

      await expect(logtoClient.signOut()).rejects.toBe(navigationError);
      await expect(storage.getItem('idToken')).resolves.toBeNull();
      await expect(storage.getItem('refreshToken')).resolves.toBeNull();
      await expect(storage.getItem('accessToken')).resolves.toBeNull();
      await expect(storage.getItem('signInSession')).resolves.toBeNull();
    });
  });
});
