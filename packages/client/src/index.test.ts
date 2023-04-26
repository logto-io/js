/* eslint-disable max-lines */
import { Prompt } from '@logto/js';

import type { LogtoSignInSessionItem } from './index.js';
import LogtoClient, { LogtoClientError } from './index.js';
import {
  appId,
  currentUnixTimeStamp,
  endpoint,
  fetchOidcConfig,
  navigate,
  LogtoClientSignInSessionAccessor,
  mockedCodeVerifier,
  mockedState,
  MockedStorage,
  requester,
  redirectUri,
  createClient,
  mockedSignInUri,
  mockedSignInUriWithLoginPrompt,
  accessToken,
  refreshToken,
  idToken,
  tokenEndpoint,
  userinfoEndpoint,
  postSignOutRedirectUri,
  revocationEndpoint,
  endSessionEndpoint,
  failingRequester,
  createAdapters,
  mockedSignUpUri,
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

const createRemoteJWKSet = jest.fn(async () => '');

jest.mock('jose', () => ({
  ...jest.requireActual('jose'),
  createRemoteJWKSet: async () => createRemoteJWKSet(),
}));

describe('LogtoClient', () => {
  describe('constructor', () => {
    it('should not throw', () => {
      expect(() => createClient()).not.toThrow();
    });

    it('should append reserved scopes', () => {
      const logtoClient = new LogtoClientSignInSessionAccessor(
        { endpoint, appId, scopes: ['foo'] },
        createAdapters()
      );
      expect(logtoClient.getLogtoConfig()).toHaveProperty('scopes', [
        'openid',
        'offline_access',
        'profile',
        'foo',
      ]);
    });

    it('should use the default prompt value "consent" if we does not provide the custom prompt', () => {
      const logtoClient = new LogtoClientSignInSessionAccessor(
        { endpoint, appId },
        createAdapters()
      );
      expect(logtoClient.getLogtoConfig()).toHaveProperty('prompt', Prompt.Consent);
    });

    it('should use the custom prompt value "login"', () => {
      const logtoClient = new LogtoClientSignInSessionAccessor(
        { endpoint, appId, prompt: Prompt.Login },
        createAdapters()
      );
      expect(logtoClient.getLogtoConfig()).toHaveProperty('prompt', 'login');
    });
  });

  describe('signInSession', () => {
    test('getter should throw LogtoClientError when signInSession does not contain the required property', async () => {
      const signInSession = new LogtoClientSignInSessionAccessor(
        { endpoint, appId },
        createAdapters()
      );

      // @ts-expect-error expected to set object without required property `state`
      await signInSession.setSignInSessionItem({
        redirectUri,
        codeVerifier: mockedCodeVerifier,
      });

      await expect(async () => signInSession.getSignInSessionItem()).rejects.toMatchError(
        new LogtoClientError('sign_in_session.invalid')
      );
    });

    it('should be able to set and get the undefined item (for clearing sign-in session)', async () => {
      const signInSession = new LogtoClientSignInSessionAccessor(
        { endpoint, appId },
        createAdapters()
      );

      await signInSession.setSignInSessionItem(null);
      await expect(signInSession.getSignInSessionItem()).resolves.toBeNull();
    });

    it('should be able to set and get the correct item', async () => {
      const signInSession = new LogtoClientSignInSessionAccessor(
        { endpoint, appId },
        createAdapters()
      );

      const signInSessionItem: LogtoSignInSessionItem = {
        redirectUri,
        codeVerifier: mockedCodeVerifier,
        state: mockedState,
      };

      await signInSession.setSignInSessionItem(signInSessionItem);
      await expect(signInSession.getSignInSessionItem()).resolves.toEqual(signInSessionItem);
    });
  });

  describe('signIn', () => {
    it('should reuse oidcConfig', async () => {
      fetchOidcConfig.mockClear();
      const logtoClient = createClient();
      await Promise.all([logtoClient.signIn(redirectUri), logtoClient.signIn(redirectUri)]);
      expect(fetchOidcConfig).toBeCalledTimes(1);
    });

    it('should redirect to signInUri just after calling signIn', async () => {
      const logtoClient = createClient();
      await logtoClient.signIn(redirectUri);
      expect(navigate).toHaveBeenCalledWith(mockedSignInUri);
    });

    it('should redirect to signInUri with interactionMode params after calling signIn with signUp mode', async () => {
      const logtoClient = createClient();
      await logtoClient.signIn(redirectUri, 'signUp');
      expect(navigate).toHaveBeenCalledWith(mockedSignUpUri);
    });

    it('should redirect to signInUri just after calling signIn with user specified prompt', async () => {
      const logtoClient = createClient(Prompt.Login);
      await logtoClient.signIn(redirectUri);
      expect(navigate).toHaveBeenCalledWith(mockedSignInUriWithLoginPrompt);
    });
  });

  describe('isSignInRedirected', () => {
    it('should return true after calling signIn', async () => {
      const logtoClient = createClient();
      await expect(logtoClient.isSignInRedirected(redirectUri)).resolves.toBeFalsy();
      await logtoClient.signIn(redirectUri);
      await expect(logtoClient.isSignInRedirected(redirectUri)).resolves.toBeTruthy();
    });
  });

  describe('handleSignInCallback', () => {
    it('should throw LogtoClientError when the sign-in session does not exist', async () => {
      const logtoClient = createClient();
      await expect(logtoClient.handleSignInCallback(redirectUri)).rejects.toMatchError(
        new LogtoClientError('sign_in_session.not_found')
      );
    });

    it('should set tokens after calling signIn and handleSignInCallback successfully', async () => {
      requester.mockClear().mockImplementation(async () => ({
        accessToken,
        refreshToken,
        idToken,
        scope: 'read register manage',
        expiresIn: 3600,
      }));
      const storage = new MockedStorage();
      const logtoClient = createClient(undefined, storage);
      await logtoClient.signIn(redirectUri);

      const code = `code_value`;
      const callbackUri = `${redirectUri}?code=${code}&state=${mockedState}&codeVerifier=${mockedCodeVerifier}`;

      expect(storage.getItem('signInSession')).not.toBeNull();
      await expect(logtoClient.handleSignInCallback(callbackUri)).resolves.not.toThrow();
      await expect(logtoClient.getAccessToken()).resolves.toEqual(accessToken);
      await expect(storage.getItem('refreshToken')).resolves.toEqual(refreshToken);
      await expect(storage.getItem('idToken')).resolves.toEqual(idToken);
      expect(requester).toHaveBeenCalledWith(tokenEndpoint, expect.anything());
      await expect(storage.getItem('signInSession')).resolves.toBeNull();
    });
  });

  describe('signOut', () => {
    const storage = new MockedStorage();

    beforeEach(() => {
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
        `${endSessionEndpoint}?client_id=${appId}&post_logout_redirect_uri=${encodedRedirectUri}`
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
      expect(navigate).toHaveBeenCalledWith(`${endSessionEndpoint}?client_id=${appId}`);
    });
  });

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

      expect(requester).toHaveBeenCalledWith(tokenEndpoint, expect.anything());
      expect(accessToken).toEqual('access_token_value');
    });

    it('should delete expired access token once', async () => {
      requester.mockClear().mockImplementation(async () => ({
        accessToken: 'access_token_value',
        refreshToken: 'new_refresh_token_value',
        expiresIn: 3600,
      }));

      const logtoClient = new LogtoClientSignInSessionAccessor(
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

    it('should reuse jwk set', async () => {
      requester.mockImplementation(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });

        return {
          IdToken: 'id_token_value',
          accessToken: 'access_token_value',
          refreshToken: 'new_refresh_token_value',
          expiresIn: 3600,
        };
      });

      createRemoteJWKSet.mockClear();
      const logtoClient = createClient(
        undefined,
        new MockedStorage({
          idToken: 'id_token_value',
          refreshToken: 'refresh_token_value',
        })
      );
      await Promise.all([logtoClient.getAccessToken('a'), logtoClient.getAccessToken('b')]);
      expect(createRemoteJWKSet).toBeCalledTimes(1);
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
/* eslint-enable max-lines */
