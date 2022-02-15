import { Optional } from '@silverhand/essentials';

import LogtoClient, { LogtoClientError, LogtoSignInSessionItem } from '.';

const clientId = 'client_id_value';
const endpoint = 'https://logto.dev';
const authorizationEndpoint = `${endpoint}/oidc/auth`;
const endSessionEndpoint = `${endpoint}/oidc/session/end`;
const revocationEndpoint = `${endpoint}/oidc/token/revocation`;
const mockedCodeVerifier = 'code_verifier_value';
const mockedState = 'state_value';
const mockedSignInUri = `${authorizationEndpoint}?foo=bar`;
const redirectUri = 'http://localhost:3000/callback';
const postSignOutRedirectUri = 'http://localhost:3000';
const idTokenStorageKey = `logto:${clientId}:idToken`;
const refreshTokenStorageKey = `logto:${clientId}:refreshToken`;
const requester = jest.fn();
const failingRequester = jest.fn().mockRejectedValue(new Error('Failed!'));

jest.mock('@logto/js', () => ({
  ...jest.requireActual('@logto/js'),
  fetchOidcConfig: async () => ({ authorizationEndpoint, endSessionEndpoint, revocationEndpoint }),
  generateCodeChallenge: jest.fn().mockResolvedValue('code_challenge_value'),
  generateCodeVerifier: jest.fn(() => mockedCodeVerifier),
  generateSignInUri: jest.fn(() => mockedSignInUri),
  generateState: jest.fn(() => mockedState),
}));

/**
 * Make LogtoClient.signInSession accessible for test
 */
class LogtoClientSignInSessionAccessor extends LogtoClient {
  public getSignInSessionItem(): Optional<LogtoSignInSessionItem> {
    return this.signInSession;
  }

  public setSignInSessionItem(item: Optional<LogtoSignInSessionItem>) {
    this.signInSession = item;
  }
}

describe('LogtoClient', () => {
  test('constructor', () => {
    expect(() => new LogtoClient({ endpoint, clientId }, requester)).not.toThrow();
  });

  describe('signInSession', () => {
    test('getter should throw LogtoClientError when signInSession does not contain the required property', () => {
      const signInSessionAccessor = new LogtoClientSignInSessionAccessor(
        { endpoint, clientId },
        requester
      );

      // @ts-expect-error
      signInSessionAccessor.setSignInSessionItem({
        redirectUri,
        codeVerifier: mockedCodeVerifier,
      });

      expect(() => signInSessionAccessor.getSignInSessionItem()).toMatchError(
        new LogtoClientError(
          'sign_in_session.invalid',
          new Error('At path: state -- Expected a string, but received: undefined')
        )
      );
    });

    test('should be able to set and get the undefined item (for clearing sign-in session)', () => {
      const signInSessionAccessor = new LogtoClientSignInSessionAccessor(
        { endpoint, clientId },
        requester
      );

      // @ts-expect-error
      signInSessionAccessor.setSignInSessionItem();
      expect(signInSessionAccessor.getSignInSessionItem()).toBeUndefined();
    });

    test('should be able to set and get the correct item', () => {
      const signInSessionAccessor = new LogtoClientSignInSessionAccessor(
        { endpoint, clientId },
        requester
      );

      const logtoSignInSessionItem: LogtoSignInSessionItem = {
        redirectUri,
        codeVerifier: mockedCodeVerifier,
        state: mockedState,
      };

      signInSessionAccessor.setSignInSessionItem(logtoSignInSessionItem);
      expect(signInSessionAccessor.getSignInSessionItem()).toEqual(logtoSignInSessionItem);
    });
  });

  describe('signIn', () => {
    test('window.location should be correct signInUri', async () => {
      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);
      await logtoClient.signIn(redirectUri);
      expect(window.location.toString()).toEqual(mockedSignInUri);
    });
  });

  describe('signOut', () => {
    beforeEach(() => {
      localStorage.setItem(idTokenStorageKey, 'id_token_value');
      localStorage.setItem(refreshTokenStorageKey, 'refresh_token_value');
    });

    test('should call token revocation endpoint with requester', async () => {
      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);
      await logtoClient.signOut(postSignOutRedirectUri);

      expect(requester).toBeCalledTimes(1);
    });

    test('should clear id token and refresh token in local storage', async () => {
      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);
      await logtoClient.signOut(postSignOutRedirectUri);

      expect(localStorage.getItem(idTokenStorageKey)).toBeNull();
      expect(localStorage.getItem(refreshTokenStorageKey)).toBeNull();
    });

    test('should redirect to post sign-out URI after signing out', async () => {
      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);
      await logtoClient.signOut(postSignOutRedirectUri);
      const encodedRedirectUri = encodeURIComponent(postSignOutRedirectUri);

      expect(window.location.toString()).toEqual(
        `${endSessionEndpoint}?id_token_hint=id_token_value&post_logout_redirect_uri=${encodedRedirectUri}`
      );
    });

    test('should not block sign out flow even if token revocation is failed', async () => {
      const logtoClient = new LogtoClient({ endpoint, clientId }, failingRequester);

      await expect(logtoClient.signOut()).resolves.not.toThrow();
      expect(failingRequester).toBeCalledTimes(1);
      expect(localStorage.getItem(idTokenStorageKey)).toBeNull();
      expect(localStorage.getItem(refreshTokenStorageKey)).toBeNull();
      expect(window.location.toString()).toEqual(
        `${endSessionEndpoint}?id_token_hint=id_token_value`
      );
    });
  });
});
