import { KeyObject } from 'crypto';

import { generateKeyPair, SignJWT } from 'jose';

import LogtoClient from '.';
import { discover, grantTokenByAuthorizationCode, grantTokenByRefreshToken } from './api';
import { DEFAULT_SCOPE_STRING, SESSION_MANAGER_KEY } from './constants';
import { MemoryStorage } from './modules/storage';
import { getLoginUrlWithCodeVerifierAndState, getLogoutUrl } from './utils/assembler';
import { createJWKS, verifyIdToken } from './utils/id-token';
import { createRequester } from './utils/requester';
import { generateCallbackUri } from './utils/utils-test';

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
    throw new TypeError('key is not instanceof KeyObject, check envirionment');
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

const fakeTokenResponse = {
  access_token: 'accessToken1',
  refresh_token: 'refreshToken1',
  id_token: ID_TOKEN,
  token_type: 'tokenType1',
  scope: DEFAULT_SCOPE_STRING,
  expires_in: 3600,
};

jest.mock('./api', () => {
  const discover = jest.fn(async () => discoverResponse);
  const grantTokenByAuthorizationCode = jest.fn(async () => Promise.resolve(fakeTokenResponse));
  const grantTokenByRefreshToken = jest.fn(async () => Promise.resolve(fakeTokenResponse));

  return {
    discover,
    grantTokenByAuthorizationCode,
    grantTokenByRefreshToken,
  };
});

const CODE_VERIFIER = 'codeVerifier1';
const STATE = 'state1';

jest.mock('./utils/assembler', () => {
  const getLoginUrlWithCodeVerifierAndState = jest.fn(async () => ({
    url: `${ISSUER}/authorize?code_challenge=${CODE_VERIFIER}&state=${STATE}&others`,
    codeVerifier: CODE_VERIFIER,
    state: STATE,
  }));

  const getLogoutUrl = jest.fn().mockReturnValue(`${ISSUER}/sign_out`);

  return {
    getLoginUrlWithCodeVerifierAndState,
    getLogoutUrl,
  };
});

jest.mock('./utils/id-token');
jest.mock('./utils/requester');

describe('LogtoClient', () => {
  describe('createLogtoClient', () => {
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

  describe('restore tokenSet from cache', () => {
    test('storage.getItem should be called', async () => {
      const storage = new MemoryStorage();
      jest.spyOn(storage, 'getItem');
      await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      expect(storage.getItem).toBeCalled();
    });

    test('claims restored', async () => {
      const storage = new MemoryStorage();
      storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, fakeTokenResponse);

      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });

      expect(logtoClient).toHaveProperty('tokenSet.accessToken', fakeTokenResponse.access_token);
      expect(logtoClient).toHaveProperty('tokenSet.refreshToken', fakeTokenResponse.refresh_token);
      expect(logtoClient).toHaveProperty('tokenSet.idToken', fakeTokenResponse.id_token);
      // TODO: update this case according to SDK Convention after refactoring TokenSet @IceHe
    });

    test('restored failed on mismatch storage key', async () => {
      const storage = new MemoryStorage();
      storage.setItem('dummy-key', fakeTokenResponse);

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

    test('session should be set', async () => {
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
    test('url contains code and state and starts with redirect_uri in session should be true', async () => {
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

    test('no code in url should be false', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, jest.fn());
      const callbackUri = generateCallbackUri({ redirectUri: REDIRECT_URI, state: STATE });
      expect(logtoClient.isLoginRedirect(callbackUri)).toBeFalsy();
    });

    test('no state in url should be false', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, jest.fn());
      const callbackUri = generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE });
      expect(logtoClient.isLoginRedirect(callbackUri)).toBeFalsy();
    });

    test('mismatch uri should be false', async () => {
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

    test('no code in url should fail', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, jest.fn());
      const callbackUri = generateCallbackUri({ redirectUri: REDIRECT_URI, state: STATE });
      await expect(logtoClient.handleCallback(callbackUri)).rejects.toThrowError();
    });

    test('no state in url should fail', async () => {
      const storage = new MemoryStorage();
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logtoClient.loginWithRedirect(REDIRECT_URI, jest.fn());
      const callbackUri = generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE });
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

    test('grantTokenByAuthorizationCode, verifyIdToken and createJWKS should be called', async () => {
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

    test('session should be cleared', async () => {
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

    test('unknown state in url should fail', async () => {
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
    describe('from local', () => {
      test('get accessToken from tokenset', async () => {
        const storage = new MemoryStorage();
        storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, fakeTokenResponse);
        const logtoClient = await LogtoClient.create({
          domain: DOMAIN,
          clientId: CLIENT_ID,
          storage,
        });
        await expect(logtoClient.getAccessToken()).resolves.toEqual(fakeTokenResponse.access_token);
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

    describe('grant new tokenset with refresh_token', () => {
      // eslint-disable-next-line @silverhand/fp/no-let
      let logtoClient: LogtoClient;

      beforeEach(async () => {
        const storage = new MemoryStorage();
        storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, {
          ...fakeTokenResponse,
          expires_in: -1,
        });
        // eslint-disable-next-line @silverhand/fp/no-mutation
        logtoClient = await LogtoClient.create({
          domain: DOMAIN,
          clientId: CLIENT_ID,
          storage,
        });
      });

      test('should get access_token after refresh', async () => {
        await expect(logtoClient.getAccessToken()).resolves.toEqual(fakeTokenResponse.access_token);
      });

      test('grantTokenByRefreshToken, verifyIdToken and createJWKS should have been called', async () => {
        expect(grantTokenByRefreshToken).toHaveBeenCalled();
        expect(verifyIdToken).toHaveBeenCalled();
        expect(createJWKS).toHaveBeenCalled();
      });
    });
  });

  describe('logout', () => {
    test('onRedirect should have been called', async () => {
      const onRedirect = jest.fn();
      const storage = new MemoryStorage();
      storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, fakeTokenResponse);
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      logtoClient.logout(REDIRECT_URI, onRedirect);
      expect(getLogoutUrl).toHaveBeenCalled();
      expect(onRedirect).toHaveBeenCalled();
    });

    test('login session should be cleared', async () => {
      const storage = new MemoryStorage();
      jest.spyOn(storage, 'removeItem');
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      logtoClient.logout(REDIRECT_URI, jest.fn());
      expect(storage.removeItem).toBeCalledWith(SESSION_MANAGER_KEY);
    });

    test('tokenset cache should be cleared', async () => {
      const storage = new MemoryStorage();
      storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, fakeTokenResponse);
      jest.spyOn(storage, 'removeItem');
      const logtoClient = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      logtoClient.logout(REDIRECT_URI, jest.fn());
      expect(storage.removeItem).toBeCalled();
    });
  });
});
