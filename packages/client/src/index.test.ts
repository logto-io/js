import LogtoClient, { LogtoClientError, UserScope } from './index.js';
import {
  appId,
  currentUnixTimeStamp,
  endpoint,
  LogtoClientWithAccessors,
  mockedCodeVerifier,
  mockedState,
  MockedStorage,
  requester,
  redirectUri,
  createClient,
  accessToken,
  refreshToken,
  idToken,
  tokenEndpoint,
  userinfoEndpoint,
  createAdapters,
} from './mock.js';
import { buildAccessTokenKey } from './utils/index.js';

describe('LogtoClient', () => {
  describe('getAccessToken', () => {
    it('should throw if idToken is empty', async () => {
      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          refreshToken: 'refresh_token_value',
        })
      );

      await expect(logtoClient.getAccessToken()).rejects.toStrictEqual(
        new LogtoClientError('not_authenticated')
      );
    });

    it('should throw if refresh token is empty', async () => {
      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          idToken: 'id_token_value',
        })
      );

      await expect(logtoClient.getAccessToken()).rejects.toStrictEqual(
        new LogtoClientError('not_authenticated', 'Refresh token not found')
      );
    });

    it('should return access token by valid refresh token', async () => {
      requester.mockClear().mockImplementation(async () => {
        return {
          accessToken: 'access_token_value',
          expiresIn: 3600,
        };
      });

      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          idToken: 'id_token_value',
          refreshToken: 'refresh_token_value',
        })
      );
      const accessToken = await logtoClient.getAccessToken();

      expect(requester).toHaveBeenCalledWith(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: 'app_id_value',
          refresh_token: 'refresh_token_value',
          grant_type: 'refresh_token',
          scope: 'openid offline_access profile',
        }).toString(),
      });
      expect(accessToken).toEqual('access_token_value');
    });

    it('should include custom scopes in refresh token request', async () => {
      requester.mockClear().mockImplementation(async () => {
        return {
          accessToken: 'access_token_value',
          expiresIn: 3600,
        };
      });

      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          idToken: 'id_token_value',
          refreshToken: 'refresh_token_value',
        }),
        false,
        ['custom', 'item']
      );
      const accessToken = await logtoClient.getAccessToken();

      expect(requester).toHaveBeenCalledWith(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: 'app_id_value',
          refresh_token: 'refresh_token_value',
          grant_type: 'refresh_token',
          scope: 'openid offline_access profile custom item',
        }).toString(),
      });
      expect(accessToken).toEqual('access_token_value');
    });

    it('should return organization token by valid refresh token', async () => {
      requester.mockClear().mockImplementation(async () => {
        return {
          accessToken: 'organization_token_value',
          expiresIn: 3600,
        };
      });

      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          idToken: 'id_token_value',
          refreshToken: 'refresh_token_value',
        }),
        undefined,
        [UserScope.Organizations]
      );
      const organizationToken = await logtoClient.getOrganizationToken('organization_id');

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
          scope: 'openid offline_access profile urn:logto:scope:organizations',
        }).toString(),
      });
      expect(organizationToken).toEqual('organization_token_value');
    });

    it('should throw error when fetch organization token without organization scope', async () => {
      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          idToken: 'id_token_value',
          refreshToken: 'refresh_token_value',
        })
      );

      await expect(logtoClient.getOrganizationToken('organization_id')).rejects.toStrictEqual(
        new LogtoClientError('missing_scope_organizations')
      );
    });

    it('should reuse the Promise if there is an ongoing request', async () => {
      requester.mockClear().mockImplementation(async () => {
        // Add a delay to simulate a slow network.
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
        return {
          accessToken: 'access_token_value',
          expiresIn: 3600,
        };
      });

      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          idToken: 'id_token_value',
          refreshToken: 'refresh_token_value',
        })
      );
      const accessTokens = await Promise.all([
        logtoClient.getAccessToken(),
        logtoClient.getAccessToken(),
        logtoClient.getAccessToken(),
      ]);

      expect(requester).toHaveBeenCalledTimes(1);
      expect(accessTokens).toEqual([
        'access_token_value',
        'access_token_value',
        'access_token_value',
      ]);

      logtoClient.getAccessTokenMap().clear();
      requester.mockImplementationOnce(async () => {
        return {
          accessToken: 'another_access_token_value',
          expiresIn: 3600,
        };
      });

      const anotherAccessTokens = await Promise.all([
        logtoClient.getAccessToken(),
        logtoClient.getAccessToken(),
        logtoClient.getAccessToken(),
      ]);

      expect(requester).toHaveBeenCalledTimes(2);
      expect(anotherAccessTokens).toEqual([
        'another_access_token_value',
        'another_access_token_value',
        'another_access_token_value',
      ]);
    });

    it('should delete expired access token once', async () => {
      requester.mockClear().mockImplementation(async () => ({
        accessToken: 'access_token_value',
        refreshToken: 'new_refresh_token_value',
        expiresIn: 3600,
      }));

      const logtoClient = new LogtoClientWithAccessors(
        { endpoint, appId },
        {
          ...createAdapters(),
          storage: new MockedStorage({
            idToken: 'id_token_value',
            refreshToken: 'refresh_token_value',
          }),
        }
      );

      const accessTokenMap = logtoClient.getAccessTokenMap();
      vi.spyOn(accessTokenMap, 'delete');
      accessTokenMap.set('@', {
        token: 'token_value',
        scope: 'scope_value',
        expiresAt: Date.now() / 1000 - 1,
      });

      await Promise.all([logtoClient.getAccessToken(), logtoClient.getAccessToken()]);
      expect(accessTokenMap.delete).toBeCalledTimes(1);
    });

    it('should load access token', async () => {
      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          idToken,
          accessToken: JSON.stringify({
            [buildAccessTokenKey()]: {
              token: accessToken,
              scope: '',
              expiresAt: Date.now() + 1000,
            },
          }),
        })
      );

      await expect(logtoClient.getAccessToken()).resolves.toEqual(accessToken);
    });

    it('should not load access token when storage value is invalid', async () => {
      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          idToken,
          accessToken: JSON.stringify({
            [buildAccessTokenKey()]: {
              token1: accessToken,
              scope: '',
              expiresAt: Date.now() + 1000,
            },
          }),
        })
      );

      await expect(logtoClient.getAccessToken()).rejects.toThrow();
    });

    it('should not save and reload access token during sign in flow', async () => {
      const storage = new MockedStorage();

      requester.mockClear().mockImplementation(async () => ({
        accessToken,
        refreshToken,
        idToken,
        scope: 'read register manage',
        expiresIn: 3600,
      }));
      const logtoClient = createClient(undefined, storage);
      await logtoClient.signIn(redirectUri);
      const code = `code_value`;
      const callbackUri = `${redirectUri}?code=${code}&state=${mockedState}&codeVerifier=${mockedCodeVerifier}`;
      await logtoClient.handleSignInCallback(callbackUri);

      await storage.removeItem('refreshToken');
      const anotherClient = createClient(undefined, storage);

      await expect(anotherClient.getAccessToken()).resolves.not.toThrow();
    });
  });

  describe('clearAccessToken', () => {
    it('should clear access token cache storage', async () => {
      const storage = new MockedStorage({
        idToken,
        refreshToken,
        accessToken: JSON.stringify({
          [buildAccessTokenKey()]: {
            token: accessToken,
            scope: '',
            expiresAt: Date.now() + 1000,
          },
        }),
      });
      const logtoClient = createClient(undefined, storage);
      await logtoClient.clearAccessToken();
      await expect(storage.getItem('accessToken')).resolves.toBeNull();
    });
  });

  describe('clearAllTokens', () => {
    it('should clear all tokens', async () => {
      const storage = new MockedStorage({
        idToken,
        refreshToken,
        accessToken: JSON.stringify({
          [buildAccessTokenKey()]: {
            token: accessToken,
            scope: '',
            expiresAt: Date.now() + 1000,
          },
        }),
      });
      const logtoClient = createClient(undefined, storage);
      await logtoClient.clearAllTokens();
      await expect(storage.getItem('idToken')).resolves.toBeNull();
      await expect(storage.getItem('refreshToken')).resolves.toBeNull();
      await expect(storage.getItem('accessToken')).resolves.toBeNull();
    });
  });

  describe('getIdTokenClaims', () => {
    it('should throw if id token is empty', async () => {
      const logtoClient = createClient();

      await expect(async () => logtoClient.getIdTokenClaims()).rejects.toStrictEqual(
        new LogtoClientError('not_authenticated', 'ID token not found')
      );
    });

    it('should return id token claims', async () => {
      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          idToken: 'id_token_value',
        })
      );
      const idTokenClaims = await logtoClient.getIdTokenClaims();

      expect(idTokenClaims).toEqual({
        iss: 'issuer_value',
        sub: 'subject_value',
        aud: 'audience_value',
        exp: currentUnixTimeStamp + 3600,
        iat: currentUnixTimeStamp,
        at_hash: 'at_hash_value',
      });
    });
  });

  describe('fetchUserInfo', () => {
    it('should throw if access token is empty', async () => {
      const logtoClient = new LogtoClient(
        { endpoint, appId },
        {
          ...createAdapters(),
          requester,
          storage: new MockedStorage({
            idToken: 'id_token_value',
            refreshToken: 'refresh_token_value',
            accessToken: JSON.stringify({
              [buildAccessTokenKey()]: {
                token: '',
                scope: '',
                expiresAt: Date.now() + 1000,
              },
            }),
          }),
        }
      );

      await expect(logtoClient.fetchUserInfo()).rejects.toStrictEqual(
        new LogtoClientError('fetch_user_info_failed')
      );
    });

    it('should return user information', async () => {
      requester
        .mockClear()
        .mockImplementationOnce(async () => ({ accessToken: 'access_token_value' }))
        .mockImplementationOnce(async () => ({ sub: 'subject_value' }));

      const logtoClient = new LogtoClient(
        { endpoint, appId },
        {
          ...createAdapters(),
          requester,
          storage: new MockedStorage({ idToken, refreshToken }),
        }
      );
      const userInfo = await logtoClient.fetchUserInfo();

      expect(requester).toHaveBeenCalledWith(userinfoEndpoint, {
        headers: { Authorization: 'Bearer access_token_value' },
      });
      expect(userInfo).toEqual({ sub: 'subject_value' });
    });
  });
});
