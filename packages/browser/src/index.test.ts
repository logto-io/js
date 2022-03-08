import { generateSignInUri } from '@logto/js';
import { Nullable } from '@silverhand/essentials';

import LogtoClient, { LogtoClientError, LogtoSignInSessionItem } from '.';

const clientId = 'client_id_value';
const endpoint = 'https://logto.dev';

const authorizationEndpoint = `${endpoint}/oidc/auth`;
const userinfoEndpoint = `${endpoint}/oidc/me`;
const tokenEndpoint = `${endpoint}/oidc/token`;
const endSessionEndpoint = `${endpoint}/oidc/session/end`;
const revocationEndpoint = `${endpoint}/oidc/token/revocation`;
const jwksUri = `${endpoint}/oidc/jwks`;
const issuer = 'http://localhost:443/oidc';

const redirectUri = 'http://localhost:3000/callback';
const postSignOutRedirectUri = 'http://localhost:3000';

const mockCodeChallenge = 'code_challenge_value';
const mockedCodeVerifier = 'code_verifier_value';
const mockedState = 'state_value';
const mockedSignInUri = generateSignInUri({
  authorizationEndpoint,
  clientId,
  redirectUri,
  codeChallenge: mockCodeChallenge,
  state: mockedState,
});

const refreshTokenStorageKey = `logto:${clientId}:refreshToken`;
const idTokenStorageKey = `logto:${clientId}:idToken`;

const accessToken = 'access_token_value';
const refreshToken = 'new_refresh_token_value';
const idToken = 'id_token_value';

const requester = jest.fn();
const failingRequester = jest.fn().mockRejectedValue(new Error('Failed!'));
const currentUnixTimeStamp = Date.now() / 1000;

jest.mock('@logto/js', () => ({
  ...jest.requireActual('@logto/js'),
  fetchOidcConfig: jest.fn(async () => ({
    authorizationEndpoint,
    userinfoEndpoint,
    tokenEndpoint,
    endSessionEndpoint,
    revocationEndpoint,
    jwksUri,
    issuer,
  })),
  fetchTokenByAuthorizationCode: jest.fn(async () => ({
    accessToken,
    refreshToken,
    idToken,
    scope: 'read register manage',
    expiresIn: 3600,
  })),
  fetchTokenByRefreshToken: jest.fn(async () => ({
    accessToken: 'access_token_value',
    refreshToken: 'new_refresh_token_value',
    expiresIn: 3600,
  })),
  decodeIdToken: jest.fn(() => ({
    iss: 'issuer_value',
    sub: 'subject_value',
    aud: 'audience_value',
    exp: currentUnixTimeStamp + 3600,
    iat: currentUnixTimeStamp,
    at_hash: 'at_hash_value',
  })),
  generateCodeChallenge: jest.fn(async () => mockCodeChallenge),
  generateCodeVerifier: jest.fn(() => mockedCodeVerifier),
  generateState: jest.fn(() => mockedState),
  verifyIdToken: jest.fn(),
}));

/**
 * Make LogtoClient.signInSession accessible for test
 */
class LogtoClientSignInSessionAccessor extends LogtoClient {
  public getSignInSessionItem(): Nullable<LogtoSignInSessionItem> {
    return this.signInSession;
  }

  public setSignInSessionItem(item: Nullable<LogtoSignInSessionItem>) {
    this.signInSession = item;
  }
}

describe('LogtoClient', () => {
  test('constructor', () => {
    expect(() => new LogtoClient({ endpoint, clientId }, requester)).not.toThrow();
  });

  describe('signInSession', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    test('getter should throw LogtoClientError when signInSession does not contain the required property', () => {
      const signInSessionAccessor = new LogtoClientSignInSessionAccessor(
        { endpoint, clientId },
        requester
      );

      // @ts-expect-error expected to set object without required property
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

      signInSessionAccessor.setSignInSessionItem(null);
      expect(signInSessionAccessor.getSignInSessionItem()).toBeNull();
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

  describe('signIn, isSignInRedirected and handleSignInCallback', () => {
    beforeEach(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    test('should redirect to signInUri just after calling signIn', async () => {
      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);
      await logtoClient.signIn(redirectUri);
      expect(window.location.toString()).toEqual(mockedSignInUri);
    });

    test('handleSignInCallback should throw LogtoClientError when the sign-in session does not exist', async () => {
      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);
      await expect(logtoClient.handleSignInCallback(redirectUri)).rejects.toMatchError(
        new LogtoClientError('sign_in_session.not_found')
      );
    });

    test('isSignInRedirected should return true after calling signIn', async () => {
      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);
      expect(logtoClient.isSignInRedirected(redirectUri)).toBeFalsy();
      await logtoClient.signIn(redirectUri);
      expect(logtoClient.isSignInRedirected(redirectUri)).toBeTruthy();
    });

    test('tokens should be set after calling signIn and handleSignInCallback successfully', async () => {
      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);
      await logtoClient.signIn(redirectUri);

      const code = `code_value`;
      const callbackUri = `${redirectUri}?code=${code}&state=${mockedState}&codeVerifier=${mockedCodeVerifier}`;

      await expect(logtoClient.handleSignInCallback(callbackUri)).resolves.not.toThrow();
      await expect(logtoClient.getAccessToken()).resolves.toEqual(accessToken);
      expect(localStorage.getItem(refreshTokenStorageKey)).toEqual(refreshToken);
      expect(localStorage.getItem(idTokenStorageKey)).toEqual(idToken);
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

  describe('getAccessToken', () => {
    test('should throw if idToken is empty', async () => {
      localStorage.removeItem(idTokenStorageKey);
      localStorage.setItem(refreshTokenStorageKey, 'refresh_token_value');
      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);

      await expect(logtoClient.getAccessToken()).rejects.toMatchError(
        new LogtoClientError('not_authenticated')
      );
    });

    test('should throw if refresh token is empty', async () => {
      localStorage.setItem(idTokenStorageKey, 'id_token_value');
      localStorage.removeItem(refreshTokenStorageKey);
      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);

      await expect(logtoClient.getAccessToken()).rejects.toMatchError(
        new LogtoClientError('not_authenticated')
      );
    });

    test('should return access token by valid refresh token', async () => {
      localStorage.setItem(idTokenStorageKey, 'id_token_value');
      localStorage.setItem(refreshTokenStorageKey, 'refresh_token_value');

      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);
      const accessToken = await logtoClient.getAccessToken();

      expect(accessToken).toEqual('access_token_value');
    });

    afterAll(() => {
      localStorage.removeItem(idTokenStorageKey);
      localStorage.removeItem(refreshTokenStorageKey);
    });
  });

  describe('getIdTokenClaims', () => {
    test('should throw if id token is empty', async () => {
      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);

      expect(() => logtoClient.getIdTokenClaims()).toMatchError(
        new LogtoClientError('not_authenticated')
      );
    });

    test('should return id token claims', async () => {
      localStorage.setItem(idTokenStorageKey, 'id_token_value');

      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);
      const idTokenClaims = logtoClient.getIdTokenClaims();

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
    test('should throw if access token is empty', async () => {
      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);

      await expect(logtoClient.fetchUserInfo()).rejects.toMatchError(
        new LogtoClientError('not_authenticated')
      );
    });

    test('should return user information', async () => {
      requester.mockClear();
      requester.mockImplementation(async () => ({ sub: 'subject_value' }));
      localStorage.setItem(idTokenStorageKey, 'id_token_value');
      localStorage.setItem(refreshTokenStorageKey, 'refresh_token_value');

      const logtoClient = new LogtoClient({ endpoint, clientId }, requester);
      const userInfo = await logtoClient.fetchUserInfo();

      expect(requester).toHaveBeenCalledWith(userinfoEndpoint, {
        headers: { Authorization: 'Bearer access_token_value' },
      });
      expect(userInfo).toEqual({ sub: 'subject_value' });
    });
  });
});
