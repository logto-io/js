// Mock window.location
/* eslint-disable @silverhand/fp/no-delete */
/* eslint-disable @silverhand/fp/no-mutation */
import { KeyObject } from 'crypto';

import { SignJWT, generateKeyPair } from 'jose';
import nock from 'nock';

import LogtoClient from '.';
import { MemoryStorage } from './storage';
import { verifyIdToken } from './verify-id-token';

jest.mock('./verify-id-token');

const DOMAIN = 'logto.dev';
const BASE_URL = `https://${DOMAIN}`;
const CLIENT_ID = 'client1';
const DEFAULT_SCOPE = 'openid offline_access';
const SUBJECT = 'subject1';
const REDIRECT_URI = 'http://localhost:3000';
const SESSION_MANAGER_KEY = 'LOGTO_SESSION_MANAGER';
const REDIRECT_CALLBACK = `${REDIRECT_URI}?code=authorization_code`;
const REDIRECT_CALLBACK_WITH_ERROR = `${REDIRECT_CALLBACK}&error=invalid_request&error_description=code_challenge%20must%20be%20a%20string%20with%20a%20minimum%20length%20of%2043%20characters`;

const discoverResponse = {
  authorization_endpoint: `${BASE_URL}/oidc/auth`,
  issuer: `${BASE_URL}/oidc`,
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

  const locationBackup = window.location;

  beforeAll(() => {
    // Can not spy on `window.location` directly
    // @ts-expect-error
    delete window.location;
    // @ts-expect-error
    window.location = { assign: jest.fn() };
  });

  afterAll(() => {
    window.location = locationBackup;
  });

  describe('createLogtoClient', () => {
    test('create an instance', async () => {
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
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
      storage.setItem(
        `LOGTO_TOKEN_SET_CACHE::${discoverResponse.issuer}::${CLIENT_ID}::${DEFAULT_SCOPE}`,
        {
          ...fakeTokenResponse,
          id_token: (await generateIdToken()).idToken,
        }
      );
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
    test('window.location.assign should have been called', async () => {
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
      });
      await logto.loginWithRedirect(REDIRECT_URI);
      expect(window.location.assign).toHaveBeenCalled();
    });

    test('session should be set', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect(REDIRECT_URI);
      expect(storage.getItem('LOGTO_SESSION_MANAGER')).toHaveProperty('redirectUri', REDIRECT_URI);
      expect(storage.getItem('LOGTO_SESSION_MANAGER')).toHaveProperty('codeVerifier');
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
      await expect(logto.handleCallback(REDIRECT_CALLBACK)).rejects.toThrowError();
    });

    test('no code in url should fail', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await expect(logto.handleCallback('')).rejects.toThrowError();
    });

    test('should throw response error', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await expect(logto.handleCallback(REDIRECT_CALLBACK_WITH_ERROR)).rejects.toThrowError();
    });

    test('verifyIdToken should be called', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect(REDIRECT_URI);
      await logto.handleCallback(REDIRECT_CALLBACK);
      expect(verifyIdToken).toHaveBeenCalled();
    });

    test('session should be cleared', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect(REDIRECT_URI);
      await logto.handleCallback(REDIRECT_CALLBACK);
      expect(storage.getItem('LOGTO_SESSION_MANAGER')).toBeUndefined();
    });

    test('should be authenticated', async () => {
      const storage = new MemoryStorage();
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      await logto.loginWithRedirect(REDIRECT_URI);
      await logto.handleCallback(REDIRECT_CALLBACK);
      expect(logto.isAuthenticated()).toBeTruthy();
    });
  });

  describe('getAccessToken', () => {
    describe('from local', () => {
      test('get accessToken from tokenset', async () => {
        const storage = new MemoryStorage();
        storage.setItem(
          `LOGTO_TOKEN_SET_CACHE::${discoverResponse.issuer}::${CLIENT_ID}::${DEFAULT_SCOPE}`,
          {
            ...fakeTokenResponse,
            id_token: (await generateIdToken()).idToken,
          }
        );
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
        });
        await expect(logto.getAccessToken()).rejects.toThrow();
      });
    });

    describe('grant new tokenset with refresh_token', () => {
      // eslint-disable-next-line @silverhand/fp/no-let
      let logto: LogtoClient;

      beforeEach(async () => {
        const storage = new MemoryStorage();
        storage.setItem(
          `LOGTO_TOKEN_SET_CACHE::${discoverResponse.issuer}::${CLIENT_ID}::${DEFAULT_SCOPE}`,
          {
            ...fakeTokenResponse,
            id_token: (await generateIdToken()).idToken,
            expires_in: -1,
          }
        );
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
    test('window.location.assign should have been called', async () => {
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
      });
      logto.logout(REDIRECT_URI);
      expect(window.location.assign).toHaveBeenCalled();
    });

    test('login session should be cleared', async () => {
      const storage = new MemoryStorage();
      jest.spyOn(storage, 'removeItem');
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      logto.logout(REDIRECT_URI);
      expect(storage.removeItem).toBeCalledWith(SESSION_MANAGER_KEY);
    });

    test('tokenset cache should be cleared', async () => {
      const storage = new MemoryStorage();
      storage.setItem(
        `LOGTO_TOKEN_SET_CACHE::${discoverResponse.issuer}::${CLIENT_ID}::${DEFAULT_SCOPE}`,
        {
          ...fakeTokenResponse,
          id_token: (await generateIdToken()).idToken,
        }
      );
      jest.spyOn(storage, 'removeItem');
      const logto = await LogtoClient.create({
        domain: DOMAIN,
        clientId: CLIENT_ID,
        storage,
      });
      logto.logout(REDIRECT_URI);
      expect(storage.removeItem).toBeCalled();
    });
  });
});
