import LogtoClient from '.';

const appId = 'app_id_value';
const endpoint = 'https://logto.dev';

const authorizationEndpoint = `${endpoint}/oidc/auth`;
const tokenEndpoint = `${endpoint}/oidc/token`;
const endSessionEndpoint = `${endpoint}/oidc/session/end`;
const revocationEndpoint = `${endpoint}/oidc/token/revocation`;
const jwksUri = `${endpoint}/oidc/jwks`;
const issuer = 'http://localhost:443/oidc';

const redirectUri = 'http://localhost:3000/callback';
const mockCodeChallenge = 'code_challenge_value';
const mockedCodeVerifier = 'code_verifier_value';
const mockedState = 'state_value';
const accessToken = 'access_token_value';
const refreshToken = 'new_refresh_token_value';
const idToken = 'id_token_value';
const currentUnixTimeStamp = Date.now() / 1000;
const storageKey = `logto:${appId}`;

const fetchOidcConfig = jest.fn(async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

  return {
    authorizationEndpoint,
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
  fetchTokenByAuthorizationCode: jest.fn(async () => ({
    accessToken,
    refreshToken,
    idToken,
    scope: 'read register manage',
    expiresIn: 3600,
  })),
}));

jest.mock('./utils/generators', () => ({
  ...jest.requireActual('./utils/generators'),
  generateCodeChallenge: jest.fn(async () => mockCodeChallenge),
  generateCodeVerifier: jest.fn(() => mockedCodeVerifier),
  generateState: jest.fn(() => mockedState),
}));

const createRemoteJWKSet = jest.fn(async () => '');

jest.mock('jose', () => ({
  ...jest.requireActual('jose'),
  createRemoteJWKSet: async () => createRemoteJWKSet(),
}));

describe('LogtoClient', () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('constructor', () => {
    it('constructor should not throw', () => {
      expect(() => new LogtoClient({ endpoint, appId })).not.toThrow();
    });
  });

  describe('storage', () => {
    it('should set tokens to sessionStorage and localStorage properly', async () => {
      const logtoClient = new LogtoClient({ endpoint, appId });
      await logtoClient.signIn(redirectUri);

      const code = `code_value`;
      const callbackUri = `${redirectUri}?code=${code}&state=${mockedState}&codeVerifier=${mockedCodeVerifier}`;

      expect(sessionStorage.getItem(storageKey)).not.toBeNull();
      await logtoClient.handleSignInCallback(callbackUri);
      expect(localStorage.getItem(`${storageKey}:refreshToken`)).toEqual(refreshToken);
      expect(localStorage.getItem(`${storageKey}:idToken`)).toEqual(idToken);
    });
  });

  describe('handleRedirect', () => {
    it('should cause location change after calling signIn', async () => {
      expect(window.location.toString()).not.toContain(endpoint);
      const logtoClient = new LogtoClient({ endpoint, appId });
      await logtoClient.signIn(redirectUri);
      expect(window.location.toString()).toContain(endpoint);
    });
  });
});
