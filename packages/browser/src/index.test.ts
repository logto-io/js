import { generateSignInUri } from '@logto/js';
import { Nullable } from '@silverhand/essentials';

import LogtoClient, { AccessToken, LogtoClientError, LogtoSignInSessionItem } from '.';

const appId = 'app_id_value';
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
  clientId: appId,
  redirectUri,
  codeChallenge: mockCodeChallenge,
  state: mockedState,
});

const refreshTokenStorageKey = `logto:${appId}:refreshToken`;
const idTokenStorageKey = `logto:${appId}:idToken`;
const signInSessionStorageKey = `logto:${appId}`;

const accessToken = 'access_token_value';
const refreshToken = 'new_refresh_token_value';
const idToken = 'id_token_value';

const requester = jest.fn();
const failingRequester = jest.fn().mockRejectedValue(new Error('Failed!'));
const currentUnixTimeStamp = Date.now() / 1000;

const fetchOidcConfig = jest.fn(async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

  return {
    authorizationEndpoint,
    userinfoEndpoint,
    tokenEndpoint,
    endSessionEndpoint,
    revocationEndpoint,
    jwksUri,
    issuer,
  };
});

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
  generateCodeChallenge: jest.fn(async () => mockCodeChallenge),
  generateCodeVerifier: jest.fn(() => mockedCodeVerifier),
  generateState: jest.fn(() => mockedState),
  verifyIdToken: jest.fn(),
}));

const createRemoteJWKSet = jest.fn(async () => '');

jest.mock('jose', () => ({
  ...jest.requireActual('jose'),
  createRemoteJWKSet: async () => createRemoteJWKSet(),
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

  public getAccessTokenMap(): Map<string, AccessToken> {
    return this.accessTokenMap;
  }
}

describe('LogtoClient', () => {
  test('constructor', () => {
    expect(() => new LogtoClient({ endpoint, appId }, requester)).not.toThrow();
  });

  describe('signInSession', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    test('getter should throw LogtoClientError when signInSession does not contain the required property', () => {
      const signInSessionAccessor = new LogtoClientSignInSessionAccessor(
        { endpoint, appId },
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
        { endpoint, appId },
        requester
      );

      signInSessionAccessor.setSignInSessionItem(null);
      expect(signInSessionAccessor.getSignInSessionItem()).toBeNull();
    });

    test('should be able to set and get the correct item', () => {
      const signInSessionAccessor = new LogtoClientSignInSessionAccessor(
        { endpoint, appId },
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

    test('should reuse oidcConfig', async () => {
      fetchOidcConfig.mockClear();
      const logtoClient = new LogtoClient({ endpoint, appId }, requester);
      await Promise.all([logtoClient.signIn(redirectUri), logtoClient.signIn(redirectUri)]);
      expect(fetchOidcConfig).toBeCalledTimes(1);
    });

    test('should redirect to signInUri just after calling signIn', async () => {
      const logtoClient = new LogtoClient({ endpoint, appId }, requester);
      await logtoClient.signIn(redirectUri);
      expect(window.location.toString()).toEqual(mockedSignInUri);
    });

    test('handleSignInCallback should throw LogtoClientError when the sign-in session does not exist', async () => {
      const logtoClient = new LogtoClient({ endpoint, appId }, requester);
      await expect(logtoClient.handleSignInCallback(redirectUri)).rejects.toMatchError(
        new LogtoClientError('sign_in_session.not_found')
      );
    });

    test('isSignInRedirected should return true after calling signIn', async () => {
      const logtoClient = new LogtoClient({ endpoint, appId }, requester);
      expect(logtoClient.isSignInRedirected(redirectUri)).toBeFalsy();
      await logtoClient.signIn(redirectUri);
      expect(logtoClient.isSignInRedirected(redirectUri)).toBeTruthy();
    });

    test('tokens should be set after calling signIn and handleSignInCallback successfully', async () => {
      requester.mockClear().mockImplementation(async () => ({
        accessToken,
        refreshToken,
        idToken,
        scope: 'read register manage',
        expiresIn: 3600,
      }));
      const logtoClient = new LogtoClient({ endpoint, appId }, requester);
      await logtoClient.signIn(redirectUri);

      const code = `code_value`;
      const callbackUri = `${redirectUri}?code=${code}&state=${mockedState}&codeVerifier=${mockedCodeVerifier}`;

      expect(sessionStorage.getItem(signInSessionStorageKey)).not.toBeNull();
      await expect(logtoClient.handleSignInCallback(callbackUri)).resolves.not.toThrow();
      await expect(logtoClient.getAccessToken()).resolves.toEqual(accessToken);
      expect(localStorage.getItem(refreshTokenStorageKey)).toEqual(refreshToken);
      expect(localStorage.getItem(idTokenStorageKey)).toEqual(idToken);
      expect(requester).toHaveBeenCalledWith(tokenEndpoint, expect.anything());
      expect(sessionStorage.getItem(signInSessionStorageKey)).toBeNull();
    });
  });

  describe('signOut', () => {
    beforeEach(() => {
      localStorage.setItem(idTokenStorageKey, 'id_token_value');
      localStorage.setItem(refreshTokenStorageKey, 'refresh_token_value');
    });

    test('should call token revocation endpoint with requester', async () => {
      const logtoClient = new LogtoClient({ endpoint, appId }, requester);
      await logtoClient.signOut(postSignOutRedirectUri);

      expect(requester).toHaveBeenCalledWith(revocationEndpoint, expect.anything());
    });

    test('should clear id token and refresh token in local storage', async () => {
      const logtoClient = new LogtoClient({ endpoint, appId }, requester);
      await logtoClient.signOut(postSignOutRedirectUri);

      expect(localStorage.getItem(idTokenStorageKey)).toBeNull();
      expect(localStorage.getItem(refreshTokenStorageKey)).toBeNull();
    });

    test('should redirect to post sign-out URI after signing out', async () => {
      const logtoClient = new LogtoClient({ endpoint, appId }, requester);
      await logtoClient.signOut(postSignOutRedirectUri);
      const encodedRedirectUri = encodeURIComponent(postSignOutRedirectUri);

      expect(window.location.toString()).toEqual(
        `${endSessionEndpoint}?id_token_hint=id_token_value&post_logout_redirect_uri=${encodedRedirectUri}`
      );
    });

    test('should not block sign out flow even if token revocation is failed', async () => {
      const logtoClient = new LogtoClient({ endpoint, appId }, failingRequester);

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
      const logtoClient = new LogtoClient({ endpoint, appId }, requester);

      await expect(logtoClient.getAccessToken()).rejects.toMatchError(
        new LogtoClientError('not_authenticated')
      );
    });

    test('should throw if refresh token is empty', async () => {
      localStorage.setItem(idTokenStorageKey, 'id_token_value');
      localStorage.removeItem(refreshTokenStorageKey);
      const logtoClient = new LogtoClient({ endpoint, appId }, requester);

      await expect(logtoClient.getAccessToken()).rejects.toMatchError(
        new LogtoClientError('not_authenticated')
      );
    });

    test('should return access token by valid refresh token', async () => {
      // eslint-disable-next-line @silverhand/fp/no-let
      let count = 0;

      requester.mockClear().mockImplementation(async () => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        count += 1;
        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });

        return {
          accessToken: count === 1 ? 'access_token_value' : 'nope',
          refreshToken: count === 1 ? 'new_refresh_token_value' : 'nope',
          expiresIn: 3600,
        };
      });
      localStorage.setItem(idTokenStorageKey, 'id_token_value');
      localStorage.setItem(refreshTokenStorageKey, 'refresh_token_value');

      const logtoClient = new LogtoClient({ endpoint, appId }, requester);
      const [accessToken_1, accessToken_2] = await Promise.all([
        logtoClient.getAccessToken(),
        logtoClient.getAccessToken(),
      ]);

      expect(requester).toHaveBeenCalledWith(tokenEndpoint, expect.anything());
      expect(accessToken_1).toEqual('access_token_value');
      expect(accessToken_2).toEqual('access_token_value');
      expect(logtoClient.refreshToken).toEqual('new_refresh_token_value');
    });

    test('should delete expired access token once', async () => {
      requester.mockClear().mockImplementation(async () => ({
        accessToken: 'access_token_value',
        refreshToken: 'new_refresh_token_value',
        expiresIn: 3600,
      }));
      localStorage.setItem(idTokenStorageKey, 'id_token_value');
      localStorage.setItem(refreshTokenStorageKey, 'refresh_token_value');

      const logtoClient = new LogtoClientSignInSessionAccessor({ endpoint, appId }, requester);

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

    test('should reuse jwk set', async () => {
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
      localStorage.setItem(idTokenStorageKey, 'id_token_value');
      localStorage.setItem(refreshTokenStorageKey, 'refresh_token_value');

      createRemoteJWKSet.mockClear();
      const logtoClient = new LogtoClient({ endpoint, appId }, requester);
      await Promise.all([logtoClient.getAccessToken('a'), logtoClient.getAccessToken('b')]);
      expect(createRemoteJWKSet).toBeCalledTimes(1);
    });

    afterAll(() => {
      localStorage.removeItem(idTokenStorageKey);
      localStorage.removeItem(refreshTokenStorageKey);
    });
  });

  describe('getIdTokenClaims', () => {
    test('should throw if id token is empty', async () => {
      const logtoClient = new LogtoClient({ endpoint, appId }, requester);

      expect(() => logtoClient.getIdTokenClaims()).toMatchError(
        new LogtoClientError('not_authenticated')
      );
    });

    test('should return id token claims', async () => {
      localStorage.setItem(idTokenStorageKey, 'id_token_value');

      const logtoClient = new LogtoClient({ endpoint, appId }, requester);
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
      const logtoClient = new LogtoClient({ endpoint, appId }, requester);

      await expect(logtoClient.fetchUserInfo()).rejects.toMatchError(
        new LogtoClientError('not_authenticated')
      );
    });

    test('should return user information', async () => {
      requester
        .mockClear()
        .mockImplementationOnce(async () => ({
          accessToken: 'access_token_value',
        }))
        .mockImplementationOnce(async () => ({
          sub: 'subject_value',
        }));
      localStorage.setItem(idTokenStorageKey, 'id_token_value');
      localStorage.setItem(refreshTokenStorageKey, 'refresh_token_value');

      const logtoClient = new LogtoClient({ endpoint, appId }, requester);
      const userInfo = await logtoClient.fetchUserInfo();

      expect(requester).toHaveBeenCalledWith(userinfoEndpoint, {
        headers: { Authorization: 'Bearer access_token_value' },
      });
      expect(userInfo).toEqual({ sub: 'subject_value' });
    });
  });
});
