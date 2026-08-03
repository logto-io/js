import { UserScope } from './index.js';
import {
  accessToken,
  appId,
  createAdapters,
  createClient,
  endpoint,
  idToken,
  LogtoClientWithAccessors,
  MockedStorage,
  refreshToken,
  requester,
  tokenEndpoint,
} from './mock.js';
import { buildAccessTokenKey } from './utils/index.js';

describe('LogtoClient access token cache', () => {
  describe('getAccessToken', () => {
    it('should return the cached access token without hitting the token endpoint', async () => {
      requester.mockClear();

      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          idToken,
          refreshToken,
          accessToken: JSON.stringify({
            [buildAccessTokenKey()]: {
              token: 'cached_access_token_value',
              scope: '',
              expiresAt: Date.now() / 1000 + 3600,
            },
          }),
        })
      );

      await expect(logtoClient.getAccessToken()).resolves.toEqual('cached_access_token_value');
      expect(requester).not.toHaveBeenCalled();
    });

    it('should bypass the cache and exchange a new access token when `forceRefresh` is true', async () => {
      requester.mockClear().mockImplementation(async () => ({
        accessToken: 'new_access_token_value',
        expiresIn: 3600,
      }));

      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          idToken,
          refreshToken: 'refresh_token_value',
          accessToken: JSON.stringify({
            [buildAccessTokenKey()]: {
              token: 'cached_access_token_value',
              scope: '',
              expiresAt: Date.now() / 1000 + 3600,
            },
          }),
        })
      );

      await expect(
        logtoClient.getAccessToken(undefined, undefined, { forceRefresh: true })
      ).resolves.toEqual('new_access_token_value');
      expect(requester).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOrganizationToken', () => {
    it('should bypass the cache and exchange a new organization token when `forceRefresh` is true', async () => {
      requester.mockClear().mockImplementation(async () => ({
        accessToken: 'new_organization_token_value',
        expiresIn: 3600,
      }));

      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          idToken,
          refreshToken: 'refresh_token_value',
          accessToken: JSON.stringify({
            [buildAccessTokenKey(undefined, 'organization_id')]: {
              token: 'cached_organization_token_value',
              scope: '',
              expiresAt: Date.now() / 1000 + 3600,
            },
          }),
        }),
        undefined,
        [UserScope.Organizations]
      );

      await expect(logtoClient.getOrganizationToken('organization_id')).resolves.toEqual(
        'cached_organization_token_value'
      );
      expect(requester).not.toHaveBeenCalled();

      await expect(
        logtoClient.getOrganizationToken('organization_id', { forceRefresh: true })
      ).resolves.toEqual('new_organization_token_value');
      expect(requester).toHaveBeenCalledWith(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: 'app_id_value',
          refresh_token: 'refresh_token_value',
          grant_type: 'refresh_token',
          organization_id: 'organization_id',
        }).toString(),
      });
    });
  });

  describe('clearAccessToken', () => {
    it('should only clear the matching access token when a key is specified', async () => {
      const storage = new MockedStorage({
        idToken,
        refreshToken,
        accessToken: JSON.stringify({
          [buildAccessTokenKey()]: {
            token: accessToken,
            scope: '',
            expiresAt: Date.now() / 1000 + 3600,
          },
          [buildAccessTokenKey(undefined, 'organization_id')]: {
            token: 'organization_token_value',
            scope: '',
            expiresAt: Date.now() / 1000 + 3600,
          },
        }),
      });
      const logtoClient = new LogtoClientWithAccessors(
        { endpoint, appId },
        { ...createAdapters(), storage },
        () => ({ verifyIdToken: vi.fn() })
      );

      // Wait for the initial `loadAccessTokenMap()` to settle.
      await expect(logtoClient.getAccessToken()).resolves.toEqual(accessToken);

      await logtoClient.clearAccessToken(undefined, 'organization_id');

      const accessTokenMap = logtoClient.getAccessTokenMap();
      expect(accessTokenMap.has(buildAccessTokenKey(undefined, 'organization_id'))).toBe(false);
      expect(accessTokenMap.has(buildAccessTokenKey())).toBe(true);
      await expect(storage.getItem('accessToken')).resolves.toEqual(
        JSON.stringify({
          [buildAccessTokenKey()]: accessTokenMap.get(buildAccessTokenKey()),
        })
      );
    });
  });
});
