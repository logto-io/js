import { Prompt } from '@logto/js';
import { trySafe } from '@silverhand/essentials';

import type { LogtoSignInSessionItem } from './index.js';
import { LogtoClientError } from './index.js';
import {
  appId,
  endpoint,
  fetchOidcConfig,
  navigate,
  LogtoClientWithAccessors,
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
  createAdapters,
  mockedSignUpUri,
} from './mock.js';

jest.mock('@logto/js', () => ({
  ...jest.requireActual('@logto/js'),
  fetchOidcConfig: async () => fetchOidcConfig(),
}));

describe('LogtoClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInSession', () => {
    test('getter should throw LogtoClientError when signInSession does not contain the required property', async () => {
      const signInSession = new LogtoClientWithAccessors({ endpoint, appId }, createAdapters());

      // @ts-expect-error expected to set object without required property `state`
      await signInSession.setSignInSessionItem({
        redirectUri,
        codeVerifier: mockedCodeVerifier,
      });

      await expect(async () => signInSession.getSignInSession()).rejects.toMatchError(
        new LogtoClientError('sign_in_session.invalid')
      );
    });

    it('should be able to set and get the undefined item (for clearing sign-in session)', async () => {
      const signInSession = new LogtoClientWithAccessors({ endpoint, appId }, createAdapters());

      await signInSession.setSignInSessionItem(null);
      await expect(signInSession.getSignInSession()).resolves.toBeNull();
    });

    it('should be able to set and get the correct item', async () => {
      const signInSession = new LogtoClientWithAccessors({ endpoint, appId }, createAdapters());

      const signInSessionItem: LogtoSignInSessionItem = {
        redirectUri,
        codeVerifier: mockedCodeVerifier,
        state: mockedState,
      };

      await signInSession.setSignInSessionItem(signInSessionItem);
      await expect(signInSession.getSignInSession()).resolves.toEqual(signInSessionItem);
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
      expect(navigate).toHaveBeenCalledWith(mockedSignInUri, redirectUri);
    });

    it('should redirect to signInUri with interactionMode params after calling signIn with signUp mode', async () => {
      const logtoClient = createClient();
      await logtoClient.signIn(redirectUri, 'signUp');
      expect(navigate).toHaveBeenCalledWith(mockedSignUpUri, redirectUri);
    });

    it('should redirect to signInUri just after calling signIn with user specified prompt', async () => {
      const logtoClient = createClient(Prompt.Login);
      await logtoClient.signIn(redirectUri);
      expect(navigate).toHaveBeenCalledWith(mockedSignInUriWithLoginPrompt, redirectUri);
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

    it('should only call once when calling handleSignInCallback simultaneously', async () => {
      const logtoClient = createClient();
      const spy = jest.spyOn(logtoClient, 'getSignInSession');
      await Promise.all([
        trySafe(logtoClient.handleSignInCallback(redirectUri)),
        trySafe(logtoClient.handleSignInCallback(redirectUri)),
      ]);
      expect(spy).toBeCalledTimes(1);
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
});
