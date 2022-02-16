import { Optional } from '@silverhand/essentials';

import LogtoClient, { LogtoClientError, LogtoSignInSessionItem } from '.';

const clientId = 'client_id_value';
const endpoint = 'https://logto.dev';
const authorizationEndpoint = `${endpoint}/oidc/auth`;
const mockedCodeVerifier = 'code_verifier_value';
const mockedState = 'state_value';
const mockedSignInUri = `${authorizationEndpoint}?foo=bar`;
const redirectUri = 'http://localhost:3000/callback';
const requester = jest.fn();

jest.mock('@logto/js', () => ({
  ...jest.requireActual('@logto/js'),
  fetchOidcConfig: async () => ({ authorizationEndpoint }),
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
});
