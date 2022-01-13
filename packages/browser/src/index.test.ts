import { KeyObject } from 'crypto';

import {
  discover,
  grantTokenByAuthorizationCode,
  grantTokenByRefreshToken,
  DEFAULT_SCOPE_STRING,
  SESSION_MANAGER_KEY,
  getLoginUrlWithCodeVerifierAndState,
  getLogoutUrl,
  createJWKS,
  createRequester,
  generateCallbackUri,
  verifyIdToken,
} from '@logto/js';
import { generateKeyPair, SignJWT } from 'jose';

import LogtoClient from '.';
import { MemoryStorage } from './modules/storage';

const DOMAIN = 'logto.dev';
const BASE_URL = `https://${DOMAIN}`;
const ISSUER = `${BASE_URL}/oidc`;
const CLIENT_ID = 'client1';
const SUBJECT = 'subject1';
const REDIRECT_URI = 'http://localhost:3000';
const CODE = 'code1';
const LOGTO_TOKEN_SET_CACHE_KEY = encodeURIComponent(
  `LOGTO_TOKEN_SET_CACHE::${ISSUER}::${CLIENT_ID}::${DEFAULT_SCOPE_STRING}`
);

const discoverResponse = {
  authorization_endpoint: `${BASE_URL}/oidc/auth`,
  issuer: ISSUER,
  jwks_uri: `${BASE_URL}/oidc/jwks`,
  token_endpoint: `${BASE_URL}/oidc/token`,
  revocation_endpoint: `${BASE_URL}/oidc/token/revocation`,
  end_session_endpoint: `${BASE_URL}/oidc/session/end`,
};

const generateIdToken = async () => {
  const { privateKey, publicKey } = await generateKeyPair('RS256');

  if (!(publicKey instanceof KeyObject)) {
    throw new TypeError('key is not instanceof KeyObject, check environment');
  }

  return new SignJWT({})
    .setProtectedHeader({ alg: 'RS256' })
    .setAudience(CLIENT_ID)
    .setSubject(SUBJECT)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(privateKey);
};

const ID_TOKEN = generateIdToken();

const tokenResponse = {
  access_token: 'accessToken1',
  refresh_token: 'refreshToken1',
  id_token: ID_TOKEN,
  token_type: 'tokenType1',
  scope: DEFAULT_SCOPE_STRING,
  expires_in: 3600,
};

const CODE_VERIFIER = 'codeVerifier1';
const STATE = 'state1';

jest.mock('@logto/js', () => {
  const discover = jest.fn(async () => discoverResponse);
  const grantTokenByAuthorizationCode = jest.fn(async () => Promise.resolve(tokenResponse));
  const grantTokenByRefreshToken = jest.fn(async () => Promise.resolve(tokenResponse));
  const getLoginUrlWithCodeVerifierAndState = jest.fn(async () => ({
    url: `${ISSUER}/authorize?code_challenge=${CODE_VERIFIER}&state=${STATE}&others`,
    codeVerifier: CODE_VERIFIER,
    state: STATE,
  }));
  const getLogoutUrl = jest.fn().mockReturnValue(`${ISSUER}/sign_out`);

  return {
    ...jest.requireActual('@logto/js'),
    discover,
    grantTokenByAuthorizationCode,
    grantTokenByRefreshToken,
    getLoginUrlWithCodeVerifierAndState,
    getLogoutUrl,
    createJWKS: jest.fn(),
    createRequester: jest.fn(),
    verifyIdToken: jest.fn(),
  };
});

describe('LogtoClient', () => {
  describe('create', () => {
    test('create an instance', async () => {
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage: new MemoryStorage(),
      });

      expect(logtoClient).toBeInstanceOf(LogtoClient);
    });

    test('discover and createRequester should have been called', async () => {
      await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
      });

      expect(discover).toHaveBeenCalled();
      expect(createRequester).toHaveBeenCalled();
    });
  });

  describe('restore token response from storage', () => {
    test('storage.getItem should have been called', async () => {
      const storage = new MemoryStorage();
      jest.spyOn(storage, 'getItem');

      await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });

      expect(storage.getItem).toHaveBeenCalled();
    });

    test('should restore token response', async () => {
      const storage = new MemoryStorage();
      storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, tokenResponse);

      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });

      expect(logtoClient).toHaveProperty('tokenSet.accessToken', tokenResponse.access_token);
      expect(logtoClient).toHaveProperty('tokenSet.refreshToken', tokenResponse.refresh_token);
      expect(logtoClient).toHaveProperty('tokenSet.idToken', tokenResponse.id_token);
      // TODO: update this case according to SDK Convention after refactoring TokenSet @IceHe
    });

    test('should fail to restore token response due to mismatched key', async () => {
      const storage = new MemoryStorage();
      storage.setItem('dummy-key', tokenResponse);

      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });

      expect(logtoClient.isAuthenticated()).toBeFalsy();
      expect(logtoClient.getClaims).toThrowError();
    });
  });

  describe('loginWithRedirect', () => {
    test('getLoginUrlWithCodeVerifierAndState and onRedirect should have been called', async () => {
      const onRedirect = jest.fn();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage: new MemoryStorage(),
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, onRedirect);

      expect(getLoginUrlWithCodeVerifierAndState).toHaveBeenCalled();
      expect(onRedirect).toHaveBeenCalled();
    });

    test('should set session', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, jest.fn());

      const sessionPayload = storage.getItem('LOGTO_SESSION_MANAGER');
      expect(sessionPayload).toHaveProperty('redirectUri', REDIRECT_URI);
      expect(sessionPayload).toHaveProperty('codeVerifier', CODE_VERIFIER);
      expect(sessionPayload).toHaveProperty('state', STATE);
    });
  });

  describe('isLoginRedirect', () => {
    test('callback uri, containing code and state and starting with redirect uri, should be true', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, jest.fn());

      const callbackUri = generateCallbackUri({
        redirectUri: REDIRECT_URI,
        code: CODE,
        state: STATE,
      });
      expect(logtoClient.isLoginRedirect(callbackUri)).toBeTruthy();
    });

    test('empty session should be false', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });

      const callbackUri = generateCallbackUri({
        redirectUri: REDIRECT_URI,
        code: CODE,
        state: STATE,
      });
      expect(logtoClient.isLoginRedirect(callbackUri)).toBeFalsy();
    });

    test('no code in uri should be false', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, jest.fn());

      const callbackUri = generateCallbackUri({
        redirectUri: REDIRECT_URI,
        state: STATE,
      });
      expect(logtoClient.isLoginRedirect(callbackUri)).toBeFalsy();
    });

    test('no state in uri should be false', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, jest.fn());

      const callbackUri = generateCallbackUri({
        redirectUri: REDIRECT_URI,
        code: CODE,
      });
      expect(logtoClient.isLoginRedirect(callbackUri)).toBeFalsy();
    });

    test('starting with mismatched redirect uri should be false', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect('http://example.com', jest.fn());

      const callbackUri = generateCallbackUri({
        redirectUri: REDIRECT_URI,
        code: CODE,
        state: STATE,
      });
      expect(logtoClient.isLoginRedirect(callbackUri)).toBeFalsy();
    });
  });

  describe('handleCallback', () => {
    test('empty session should fail', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });

      const callbackUri = generateCallbackUri({
        redirectUri: REDIRECT_URI,
        code: CODE,
        state: STATE,
      });
      await expect(logtoClient.handleCallback(callbackUri)).rejects.toThrowError();
    });

    test('no code in uri should fail', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, jest.fn());

      const callbackUri = generateCallbackUri({
        redirectUri: REDIRECT_URI,
        state: STATE,
      });
      await expect(logtoClient.handleCallback(callbackUri)).rejects.toThrowError();
    });

    test('no state in uri should fail', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, jest.fn());

      const callbackUri = generateCallbackUri({
        redirectUri: REDIRECT_URI,
        code: CODE,
      });
      await expect(logtoClient.handleCallback(callbackUri)).rejects.toThrowError();
    });

    test('should throw response error', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });

      const callbackUri = generateCallbackUri({
        redirectUri: REDIRECT_URI,
        code: CODE,
        state: STATE,
        error: 'invalid_request',
        errorDescription: 'code_challenge must be a string with a minimum length of 43 characters',
      });
      await expect(logtoClient.handleCallback(callbackUri)).rejects.toThrowError();
    });

    test('grantTokenByAuthorizationCode, verifyIdToken and createJWKS should have been called', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, jest.fn());

      const callbackUri = generateCallbackUri({
        redirectUri: REDIRECT_URI,
        code: CODE,
        state: STATE,
      });
      await logtoClient.handleCallback(callbackUri);

      expect(grantTokenByAuthorizationCode).toHaveBeenCalled();
      expect(verifyIdToken).toHaveBeenCalled();
      expect(createJWKS).toHaveBeenCalled();
    });

    test('should clear session after handleCallback', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, jest.fn());

      const callbackUri = generateCallbackUri({
        redirectUri: REDIRECT_URI,
        code: CODE,
        state: STATE,
      });
      await logtoClient.handleCallback(callbackUri);

      expect(storage.getItem('LOGTO_SESSION_MANAGER')).toBeUndefined();
    });

    test('unknown state in uri should fail', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, jest.fn());

      const unknownState = `UNKNOWN_${STATE}`;
      const callbackUri = generateCallbackUri({
        redirectUri: REDIRECT_URI,
        code: CODE,
        state: unknownState,
      });

      await expect(logtoClient.handleCallback(callbackUri)).rejects.toThrowError();
    });

    test('should be authenticated', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, jest.fn());

      const callbackUri = generateCallbackUri({
        redirectUri: REDIRECT_URI,
        code: CODE,
        state: STATE,
      });
      await logtoClient.handleCallback(callbackUri);

      expect(logtoClient.isAuthenticated()).toBeTruthy();
    });
  });

  describe('getAccessToken', () => {
    describe('from local storage', () => {
      test('get access token from token response', async () => {
        const storage = new MemoryStorage();
        storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, tokenResponse);

        const logtoClient = await LogtoClient.create({
          domain: DOMAIN,
          clientId: CLIENT_ID,
          storage,
        });

        await expect(logtoClient.getAccessToken()).resolves.toEqual(tokenResponse.access_token);
      });

      test('not authenticated should throw', async () => {
        const logtoClient = await LogtoClient.create({
          domain: DOMAIN,
          clientId: CLIENT_ID,
          storage: new MemoryStorage(),
        });

        await expect(logtoClient.getAccessToken()).rejects.toThrow();
      });
    });

    describe('grant new token with refresh token', () => {
      // eslint-disable-next-line @silverhand/fp/no-let
      let logtoClient: LogtoClient;

      beforeEach(async () => {
        const storage = new MemoryStorage();
        storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, {
          ...tokenResponse,
          expires_in: -1,
        });

        // eslint-disable-next-line @silverhand/fp/no-mutation
        logtoClient = await LogtoClient.create({
          domain: DOMAIN,
          clientId: CLIENT_ID,
          storage,
        });
      });

      test('should get access token after refreshing', async () => {
        await expect(logtoClient.getAccessToken()).resolves.toEqual(tokenResponse.access_token);
      });

      test('grantTokenByRefreshToken, verifyIdToken and createJWKS should have been called', async () => {
        expect(grantTokenByRefreshToken).toHaveBeenCalled();
        expect(verifyIdToken).toHaveBeenCalled();
        expect(createJWKS).toHaveBeenCalled();
      });
    });
  });

  describe('logout', () => {
    test('getLogoutUrl and onRedirect should have been called', async () => {
      const onRedirect = jest.fn();
      const storage = new MemoryStorage();
      storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, tokenResponse);

      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      logtoClient.logout(REDIRECT_URI, onRedirect);

      expect(getLogoutUrl).toHaveBeenCalled();
      expect(onRedirect).toHaveBeenCalled();
    });

    test('should clear session', async () => {
      const storage = new MemoryStorage();
      jest.spyOn(storage, 'removeItem');

      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      logtoClient.logout(REDIRECT_URI, jest.fn());

      expect(storage.removeItem).toHaveBeenCalledWith(SESSION_MANAGER_KEY);
    });

    test('should clear token response cache ', async () => {
      const storage = new MemoryStorage();
      storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, tokenResponse);
      jest.spyOn(storage, 'removeItem');

      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      logtoClient.logout(REDIRECT_URI, jest.fn());

      expect(storage.removeItem).toHaveBeenCalled();
    });
  });
});
