import LogtoClient from './index';

const clientId = 'client_id_value';
const endpoint = 'https://logto.dev';
const authorizationEndpoint = `${endpoint}/oidc/auth`;
const redirectUri = 'http://localhost:3000/callback';
const requester = jest.fn();
const signInUri = `${authorizationEndpoint}?foo=bar`;

jest.mock('@logto/js', () => {
  return {
    ...jest.requireActual('@logto/js'),
    fetchOidcConfig: async () => ({ authorizationEndpoint }),
    generateSignInUri: () => signInUri,
  };
});

describe('LogtoClient', () => {
  test('constructor', () => {
    expect(() => new LogtoClient({ endpoint, clientId, requester })).not.toThrow();
  });

  describe('signIn', () => {
    test('window.location should be correct signInUri', async () => {
      const logtoClient = new LogtoClient({ endpoint, clientId, requester });
      await logtoClient.signIn(redirectUri);
      expect(window.location.toString()).toEqual(signInUri);
    });
  });
});
