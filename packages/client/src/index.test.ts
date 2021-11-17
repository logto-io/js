import { KeyObject } from 'crypto';

import { generateKeyPair, SignJWT } from 'jose';
import nock from 'nock';

import LogtoClient from '.';
import { DEFAULT_SCOPE_STRING, SESSION_MANAGER_KEY } from './constants';
import { MemoryStorage } from './storage';
import { verifyIdToken } from './verify-id-token';
import { generateCallbackUri } from './utils';

const STATE = 'state1';

jest.mock('./generators', () => ({
  ...jest.requireActual('./generators'),
  generateState: () => STATE,
}));

jest.mock('./verify-id-token');

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

const fakeTokenResponse = {
  access_token: 'access_token',
  expires_in: 3600,
  id_token: 'id_token',
  refresh_token: 'refresh_token',
};

const generateIdToken = async () => {
  const { privateKey, publicKey } = await generateKeyPair('RS256');

  if (!(publicKey instanceof KeyObject)) {
    throw new TypeError('key is not instanceof KeyObject, check envirionment');
  }

  const key = publicKey.export({ format: 'jwk' });
  nock(BASE_URL)
    .get('/oidc/jwks')
    .reply(200, { keys: [key] });
  const idToken = await new SignJWT({})
    .setProtectedHeader({ alg: 'RS256' })
    .setAudience(CLIENT_ID)
    .setSubject(SUBJECT)
    .setIssuer(discoverResponse.issuer)
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(privateKey);

  return { idToken, key };
};

describe('LogtoClient', () => {
  beforeEach(async () => {
    const { idToken } = await generateIdToken();

    nock(BASE_URL)
      .post('/oidc/token')
      .reply(200, {
        ...fakeTokenResponse,
        id_token: idToken,
      });
    nock(BASE_URL).get('/oidc/.well-known/openid-configuration').reply(200, discoverResponse);
  });

  describe('createLogtoClient', () => {
    test('create an instance', async () => {
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage: new MemoryStorage(),
      });
      expect(logto).toBeInstanceOf(LogtoClient);
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
      storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, {
        ...fakeTokenResponse,
        id_token: (await generateIdToken()).idToken,
      });
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      expect(logto.isAuthenticated()).toBeTruthy();
      expect(logto.getClaims()).toHaveProperty('sub', SUBJECT);
    });

    test('restored failed on mismatch storage key', async () => {
      const storage = new MemoryStorage();
      storage.setItem('dummy-key', {
        ...fakeTokenResponse,
        id_token: (await generateIdToken()).idToken,
      });
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      expect(logto.isAuthenticated()).toBeFalsy();
      expect(logto.getClaims).toThrowError();
    });
  });

  describe('loginWithRedirect', () => {
    test('onRedirect should have been called', async () => {
      const onRedirect = jest.fn();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage: new MemoryStorage(),
      });
      await logto.loginWithRedirect(REDIRECT_URI, onRedirect);
      expect(onRedirect).toHaveBeenCalled();
    });

    test('session should be set', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect(REDIRECT_URI, jest.fn());
      const sessionPayload = storage.getItem('LOGTO_SESSION_MANAGER');
      expect(sessionPayload).toHaveProperty('redirectUri', REDIRECT_URI);
      expect(sessionPayload).toHaveProperty('codeVerifier');
      expect(sessionPayload).toHaveProperty('state');
    });
  });

  describe('isLoginRedirect', () => {
    test('url contains code and state and starts with redirect_uri in session should be true', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect(REDIRECT_URI, jest.fn());
      expect(
        logto.isLoginRedirect(
          generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE, state: STATE })
        )
      ).toBeTruthy();
    });

    test('empty session should be false', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      expect(
        logto.isLoginRedirect(
          generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE, state: STATE })
        )
      ).toBeFalsy();
    });

    test('no code in url should be false', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect(REDIRECT_URI, jest.fn());
      expect(
        logto.isLoginRedirect(generateCallbackUri({ redirectUri: REDIRECT_URI, state: STATE }))
      ).toBeFalsy();
    });

    test('no state in url should be false', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect(REDIRECT_URI, jest.fn());
      expect(
        logto.isLoginRedirect(generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE }))
      ).toBeFalsy();
    });

    test('mismatch uri should be false', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect('http://example.com', jest.fn());
      expect(logto.isLoginRedirect(REDIRECT_URI)).toBeFalsy();
    });
  });

  describe('handleCallback', () => {
    test('empty session should fail', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await expect(
        logto.handleCallback(
          generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE, state: STATE })
        )
      ).rejects.toThrowError();
    });

    test('no code in url should fail', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect(REDIRECT_URI, jest.fn());
      await expect(
        logto.handleCallback(generateCallbackUri({ redirectUri: REDIRECT_URI, state: STATE }))
      ).rejects.toThrowError();
    });

    test('no state in url should fail', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect(REDIRECT_URI, jest.fn());
      await expect(
        logto.handleCallback(generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE }))
      ).rejects.toThrowError();
    });

    test('should throw response error', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await expect(
        logto.handleCallback(
          generateCallbackUri({
            redirectUri: REDIRECT_URI,
            code: CODE,
            state: STATE,
            error: 'invalid_request',
            errorDescription:
              'code_challenge must be a string with a minimum length of 43 characters',
          })
        )
      ).rejects.toThrowError();
    });

    test('verifyIdToken should be called', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect(REDIRECT_URI, jest.fn());
      await logto.handleCallback(
        generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE, state: STATE })
      );
      expect(verifyIdToken).toHaveBeenCalled();
    });

    test('session should be cleared', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect(REDIRECT_URI, jest.fn());
      await logto.handleCallback(
        generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE, state: STATE })
      );
      expect(storage.getItem('LOGTO_SESSION_MANAGER')).toBeUndefined();
    });

    test('unknown state in url should fail', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect(REDIRECT_URI, jest.fn());
      const unknownState = `UNKNOWN_${STATE}`;
      await expect(
        logto.handleCallback(
          generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE, state: unknownState })
        )
      ).rejects.toThrowError();
    });

    test('should be authenticated', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect(REDIRECT_URI, jest.fn());
      await logto.handleCallback(
        generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE, state: STATE })
      );
      expect(logto.isAuthenticated()).toBeTruthy();
    });
  });

  describe('getAccessToken', () => {
    describe('from local', () => {
      test('get accessToken from tokenset', async () => {
        const storage = new MemoryStorage();
        storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, {
          ...fakeTokenResponse,
          id_token: (await generateIdToken()).idToken,
        });
        const logto = await LogtoClient.create({
          domain: DOMAIN,
          clientId: CLIENT_ID,
          storage,
        });
        await expect(logto.getAccessToken()).resolves.toEqual(fakeTokenResponse.access_token);
      });

      test('not authenticated should throw', async () => {
        const logto = await LogtoClient.create({
          domain: DOMAIN,
          clientId: CLIENT_ID,
          storage: new MemoryStorage(),
        });
        await expect(logto.getAccessToken()).rejects.toThrow();
      });
    });

    describe('grant new tokenset with refresh_token', () => {
      // eslint-disable-next-line @silverhand/fp/no-let
      let logto: LogtoClient;

      beforeEach(async () => {
        const storage = new MemoryStorage();
        storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, {
          ...fakeTokenResponse,
          id_token: (await generateIdToken()).idToken,
          expires_in: -1,
        });
        // eslint-disable-next-line @silverhand/fp/no-mutation
        logto = await LogtoClient.create({
          domain: DOMAIN,
          clientId: CLIENT_ID,
          storage,
        });
      });

      test('should get access_token after refresh', async () => {
        await expect(logto.getAccessToken()).resolves.toEqual(fakeTokenResponse.access_token);
      });

      test('verifyIdToken should have been called', async () => {
        expect(verifyIdToken).toHaveBeenCalled();
      });
    });
  });

  describe('logout', () => {
    test('onRedirect should have been called', async () => {
      const onRedirect = jest.fn();
      const storage = new MemoryStorage();
      storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, {
        ...fakeTokenResponse,
        id_token: (await generateIdToken()).idToken,
      });
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      logto.logout(REDIRECT_URI, onRedirect);
      expect(onRedirect).toHaveBeenCalled();
    });

    test('login session should be cleared', async () => {
      const storage = new MemoryStorage();
      jest.spyOn(storage, 'removeItem');
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      logto.logout(REDIRECT_URI, jest.fn());
      expect(storage.removeItem).toBeCalledWith(SESSION_MANAGER_KEY);
    });

    test('tokenset cache should be cleared', async () => {
      const storage = new MemoryStorage();
      storage.setItem(LOGTO_TOKEN_SET_CACHE_KEY, {
        ...fakeTokenResponse,
        id_token: (await generateIdToken()).idToken,
      });
      jest.spyOn(storage, 'removeItem');
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      logto.logout(REDIRECT_URI, jest.fn());
      expect(storage.removeItem).toBeCalled();
    });
  });

  describe('onAuthStateChange', () => {
    test('should be called on tokenSet recovery', async () => {
      const onAuthStateChange = jest.fn();
      const storage = new MemoryStorage();
      storage.setItem(
        encodeURIComponent(
          `LOGTO_TOKEN_SET_CACHE::${discoverResponse.issuer}::${CLIENT_ID}::${DEFAULT_SCOPE_STRING}`
        ),
        {
          ...fakeTokenResponse,
          id_token: (await generateIdToken()).idToken,
        }
      );
      await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
        onAuthStateChange,
      });
      expect(onAuthStateChange).toHaveBeenCalled();
    });

    test('should be called on handleCallback', async () => {
      const onAuthStateChange = jest.fn();
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
        onAuthStateChange,
      });
      await logto.loginWithRedirect(REDIRECT_URI, jest.fn());
      await logto.handleCallback(
        generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE, state: STATE })
      );
      expect(onAuthStateChange).toHaveBeenCalled();
    });

    test('should be called on logout', async () => {
      const onAuthStateChange = jest.fn();
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
        onAuthStateChange,
      });
      logto.logout(REDIRECT_URI, jest.fn());
      expect(onAuthStateChange).toHaveBeenCalled();
    });
  });
});
