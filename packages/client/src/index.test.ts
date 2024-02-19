import LogtoClient, { LogtoClientError, UserScope } from './index.js';
import {
  appId,
  currentUnixTimeStamp,
  endpoint,
  fetchOidcConfig,
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

jest.mock('@logto/js', () => ({
  ...jest.requireActual('@logto/js'),
  fetchOidcConfig: async () => fetchOidcConfig(),
  decodeIdToken: jest.fn(() => ({
    iss: 'issuer_value',
    sub: 'subject_value',
    aud: 'audience_value',
    exp: currentUnixTimeStamp + 3600,
    iat: currentUnixTimeStamp,
    at_hash: 'at_hash_value',
  })),
  verifyIdToken: jest.fn(),
}));

describe('LogtoClient', () => {
  describe('getAccessToken', () => {
    it('should throw if idToken is empty', async () => {
      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          refreshToken: 'refresh_token_value',
        })
      );

      await expect(logtoClient.getAccessToken()).rejects.toMatchError(
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

      await expect(logtoClient.getAccessToken()).rejects.toMatchError(
        new LogtoClientError('not_authenticated')
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

      await expect(logtoClient.getOrganizationToken('organization_id')).rejects.toMatchError(
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
      jest.spyOn(accessTokenMap, 'delete');
      accessTokenMap.set('@', {
        token: 'token_value',
        scope: 'scope_value',
        expiresAt: Date.now() / 1000 - 1,
      });

      await Promise.all([logtoClient.getAccessToken(), logtoClient.getAccessToken()]);
      expect(accessTokenMap.delete).toBeCalledTimes(1);
    });
  });

  describe('getIdTokenClaims', () => {
    it('should throw if id token is empty', async () => {
      const logtoClient = createClient();

      await expect(async () => logtoClient.getIdTokenClaims()).rejects.toMatchError(
        new LogtoClientError('not_authenticated')
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

  describe('getAccessToken', () => {
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

  describe('fetchUserInfo', () => {
    it('should throw if access token is empty', async () => {
      const logtoClient = new LogtoClient(
        { endpoint, appId },
        {
          ...createAdapters(),
          requester,
          storage: new MockedStorage(),
        }
      );

      await expect(logtoClient.fetchUserInfo()).rejects.toMatchError(
        new LogtoClientError('not_authenticated')
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
