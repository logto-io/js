import { verifyAndParseCodeFromCallbackUri } from './callback-uri.js';
import { LogtoError, OidcError } from './errors.js';

const code = 'some_code';
const state = 'some_state';
const error = 'some_error';
const errorDescription = 'some_error_description';
const redirectUri = 'http://localhost:3000/callback';

describe('verifyAndParseCodeFromCallbackUri', () => {
  test('valid callback uri should return correct code', () => {
    const callbackUrl = `http://localhost:3000/callback?code=${code}&state=${state}`;
    expect(verifyAndParseCodeFromCallbackUri(callbackUrl, redirectUri, state)).toEqual(code);
  });

  test('callback uri, not starting with redirect uri, should throw', () => {
    const callbackUrl = `http://localhost:3000/callback?code=${code}&state=${state}`;
    expect(() =>
      verifyAndParseCodeFromCallbackUri(callbackUrl, 'http://example.com:3000/callback', state)
    ).toMatchError(new LogtoError('callback_uri_verification.redirect_uri_mismatched'));
  });

  test('callback uri, containing error parameter, should throw', () => {
    const callbackUrl = `http://localhost:3000/callback?code=${code}&state=${state}&error=${error}`;
    expect(() => verifyAndParseCodeFromCallbackUri(callbackUrl, redirectUri, state)).toMatchError(
      new LogtoError('callback_uri_verification.error_found', new OidcError(error))
    );
  });

  test('callback uri, containing error and error_description parameters, should throw', () => {
    const callbackUrl = `http://localhost:3000/callback?code=${code}&state=${state}&error=${error}&error_description=${errorDescription}`;
    expect(() => verifyAndParseCodeFromCallbackUri(callbackUrl, redirectUri, state)).toMatchError(
      new LogtoError('callback_uri_verification.error_found', { error, errorDescription })
    );
  });

  test('callback uri, without state, should throw', () => {
    const callbackUrl = 'http://localhost:3000/callback?code=random_code';
    expect(() => verifyAndParseCodeFromCallbackUri(callbackUrl, redirectUri, state)).toMatchError(
      new LogtoError('callback_uri_verification.missing_state')
    );
  });

  test('callback uri, containing mismatched state, should throw', () => {
    const callbackUrl = `http://localhost:3000/callback?code=${code}&state=${state}`;
    expect(() =>
      verifyAndParseCodeFromCallbackUri(callbackUrl, redirectUri, 'another_state')
    ).toMatchError(new LogtoError('callback_uri_verification.state_mismatched'));
  });

  test('callback uri, without code, should throw', () => {
    const callbackUrl = `http://localhost:3000/callback?state=${state}`;
    expect(() => verifyAndParseCodeFromCallbackUri(callbackUrl, redirectUri, state)).toMatchError(
      new LogtoError('callback_uri_verification.missing_code')
    );
  });
});
