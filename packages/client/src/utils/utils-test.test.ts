import { generateCallbackUri } from './utils-test';

describe('generateCallbackUri', () => {
  const REDIRECT_URI = 'http://localhost:3000';
  const CODE = 'code1';
  const STATE = 'state1';
  const ERROR = 'invalid_request';
  const ERROR_DESCRIPTION =
    'code_challenge must be a string with a minimum length of 43 characters';

  test('generate callback url with redirectUri', () => {
    const callbackUri = generateCallbackUri({ redirectUri: REDIRECT_URI });
    expect(callbackUri).toEqual(REDIRECT_URI);
  });

  test('generate callback url with redirectUri and code', () => {
    const callbackUri = generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE });
    expect(callbackUri).toEqual(`${REDIRECT_URI}?code=${CODE}`);
  });

  test('generate callback url with redirectUri and state', () => {
    const callbackUri = generateCallbackUri({ redirectUri: REDIRECT_URI, state: STATE });
    expect(callbackUri).toEqual(`${REDIRECT_URI}?state=${STATE}`);
  });

  test('generate callback url with redirectUri, code, state and error', () => {
    const callbackUri = generateCallbackUri({
      redirectUri: REDIRECT_URI,
      code: CODE,
      state: STATE,
      error: ERROR,
    });
    expect(callbackUri).toEqual(`${REDIRECT_URI}?code=${CODE}&state=${STATE}&error=${ERROR}`);
  });

  test('generate callback url with full info', () => {
    const callbackUri = generateCallbackUri({
      redirectUri: REDIRECT_URI,
      code: CODE,
      state: STATE,
      error: ERROR,
      errorDescription: ERROR_DESCRIPTION,
    });
    expect(callbackUri).toEqual(
      encodeURI(
        `${REDIRECT_URI}?code=${CODE}&state=${STATE}&error=${ERROR}&error_description=${ERROR_DESCRIPTION}`
      )
    );
  });
});
